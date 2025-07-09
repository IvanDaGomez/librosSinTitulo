import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import Verificar from './verificar'
import { toast, ToastContainer } from 'react-toastify'
import { UserContext } from '../../context/userContext'
import './verify.css'
import { BACKEND_URL } from '../../assets/config'
import { useNavigate } from 'react-router-dom'
export default function EnviarCorreoAVerificar() {
  const navigate = useNavigate()
  const { user, setUser, loading } = useContext(UserContext)
  const [sending, setSending] = useState(true)
  const [code, setCode] = useState(null)
  const [token, setToken] = useState(null)
  const [errors, setErrors] = useState('')
  const [verifying, setVerifying] = useState(true)
  const [inputCode, setInputCode] = useState('') // Estado para almacenar el código ingresado


  // Fetch user email if not already set
  useEffect(() => {
    if (!user || user?.correo || loading) return
    if (user.validated) {
      navigate('/')
      return
    }
    async function fetchUserEmail () {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/users/c/${user.id}`,
          {
            withCredentials: true // Ensures cookies are sent with the request
          } 
        )
        if (response.data.error) {
          console.error('Error fetching user email:', response.data.error)
          return
        }
        if (response.data) {
          setUser({
            ...user,
            correo: response.data.correo
          })
        }
      } catch (error) {
        console.error('Error fetching user email:', error)
      }
    }

    fetchUserEmail()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])
  const [fetching, setFetching] = useState(false)
  async function sendVerifyEmail () {
    if (!user || !user?.correo || user.validated || fetching) return
    setFetching(true)
    try {
      const url = `${BACKEND_URL}/api/users/sendValidationEmail`
      const body = {
        correo: user.correo,
        nombre: user.nombre,
        id: user.id
      }

      const response = await axios.post(url, body, { withCredentials: true })
      if (response.data.ok) {
        setSending(false)
        setCode(response.data.code)
        setToken(response.data.token)
      }
    } catch (error) {
      console.error('Error en el servidor:', error)
    }
  }

  // Send verification email
  useEffect(() => {
    sendVerifyEmail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])


  // Verificar código ingresado
  function verifyCode () {
    if (!token) {
      setErrors('Token no válido. Por favor, intenta de nuevo.')
      return
    }
    const completeInputCode = parseInt(inputCode) // Combinar código ingresado
    if (code !== completeInputCode) {
      setErrors('El código no coincide.')
      return
    }
    setVerifying(false)
  }

  return (
    <>
      <div className='verifyContainer'>
        {verifying ? (
          <>
            <h1>Verificación</h1>
            {sending ? (<>
              <div className='imageDiv'>
                <img src='/mailAnimation.gif' alt='' />
              </div>
              <h3>Enviando correo...</h3>
            </>
            ) : (
              <>
                <p>Se ha enviado un correo de verificación a:</p>
                <p>{user && user?.correo}</p>

                <div className='imageDiv'>
                  <img src='/olvidasteContra.png' alt='Email image' loading='lazy' title='Email image'/>
                </div>
                <div className='codeInputContainer'>
                    <input
                      type="number"
                      className='codeInput'
                      placeholder='Ingresa el código'
                    onChange={(e)=>setInputCode(e.target.value)}
                    />
                </div>
                <div>
                  <p>Si no recibiste el correo</p>
                  <a onClick={() => {
                    sendVerifyEmail()
                    toast.success('Código enviado exitosamente')
                  }}
                  >Volver a enviar código
                  </a>
                </div>
                <button onClick={verifyCode}>Verificar</button>
                {errors && <p className='error'>{errors}</p>}
              </>
            )}
          </>
        ) : (
          user && <Verificar user={user} token={token} />
        )}
      </div>
      <ToastContainer
        position='top-center'
        autoClose={5000}
        hideProgressBar={false}
        pauseOnHover={false}
        closeOnClick
        theme='light'
      />
    </>
  )
}
