import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { AuthToken } from '@/domain/entities/authToken.js'
import express from 'express'
import { PartialUserType, UserType } from '@/domain/entities/user.js'
import { ID, ImageType, ISOString } from '@/shared/types'
import path from 'node:path'
import { Multer } from 'multer'
import saveOptimizedImages from '@/utils/saveOptimizedImages.js'
import { createUser } from '@/domain/mappers/createUser.js'
import { UserInterface } from '@/domain/interfaces/user.js'

async function checkEmailExists (email: string, UsersModel: UserInterface) {
  const correo = await UsersModel.getUserByEmail({ email })

  if (correo?.email) {
    throw new Error('El correo ya existe')
  }
}
function initializeDataCreateUser (data: UserType) {
  const time = new Date().toISOString() as ISOString
  data.created_at = time
  data.updated_at = time
  data.validated = false
  data.id = crypto.randomUUID()
  data.balance = {
    available: 0,
    pending: 0,
    incoming: 0
  }
  return data
}
async function processUserUpdate (
  data: Partial<UserType> & { accion?: string },
  userId: ID,
  req: express.Request,
  UsersModel: UserInterface
) {
  const file: Express.MulterS3.File | undefined = req.file as
    | Express.MulterS3.File
    | undefined
  if (file) {
    data.profile_picture = file.location as ImageType
    await saveOptimizedImages([data.profile_picture])
  }

  if (data.email) {
    await checkEmailExists(data.email, UsersModel)
    data.validated = false
  }

  return filterAllowedFields(data)
}

async function updateUserFavorites (
  userId: ID,
  bookId: ID,
  accion: string,
  UsersModel: UserInterface
): Promise<ID[]> {
  const user = await UsersModel.getUserById({ id: userId })
  console.log('User found:', user)
  if (!user) throw new Error('Usuario no encontrado')

  let updatedFavorites = user.favorites || []

  if (accion === 'agregar' && !updatedFavorites.includes(bookId)) {
    updatedFavorites.push(bookId)
  } else if (accion === 'eliminar') {
    updatedFavorites = updatedFavorites.filter(fav => fav !== bookId)
  }

  return updatedFavorites
}

function filterAllowedFields (data: Partial<UserType>): Partial<UserType> {
  const allowedFields: (keyof UserType)[] = Object.keys(
    createUser({}, true)
  ) as (keyof UserType)[]
  const filteredData: Partial<UserType> = {}

  allowedFields.forEach(key => {
    if (data[key] !== undefined) filteredData[key] = data[key] as any
  })

  filteredData.updated_at = new Date().toISOString() as ISOString
  return filteredData
}

function generateAuthToken (user: PartialUserType | UserType): string {
  try {
    const tokenPayload = {
      id: user.id,
      name: user.name
    }
    return jwt.sign(tokenPayload, process.env.JWT_SECRET ?? '', {
      expiresIn: '3h'
    })
  } catch (error) {
    throw new Error('Error generando el token')
  }
}

function setAuthCookie (res: express.Response, token: string) {
  res.clearCookie('access_token').cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 3 // 3 horas
  })
}
function jwtPipeline (user: PartialUserType | UserType, res: express.Response) {
  const newToken = generateAuthToken(user)
  if (!newToken) {
    throw new Error('Error generando el token')
  }
  setAuthCookie(res, newToken)
}
export {
  checkEmailExists,
  initializeDataCreateUser,
  processUserUpdate,
  jwtPipeline,
  updateUserFavorites
}
