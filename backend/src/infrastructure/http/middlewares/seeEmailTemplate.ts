import express from 'express'
import { templates, DataType } from '../assets/email/htmlTemplates.js'
import { mockEmailData } from './mockEmailData.js'

export function seeEmailTemplate (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const { template } = req.params

    if (template === 'fetchTemplates') {
      const templateNames = templates.map(t => t.name)
      res.json(templateNames)
      return
    }
    if (!template) {
      res.status(400).json({ error: 'Template name is required' })
      return
    }
    const templateFound = templates.find(t => t.name === template)

    if (!templateFound) {
      res.status(404).json({ error: 'Template not found' })
      return
    }
    const templateContent = templateFound(
      mockEmailData as Required<DataType>,
      true
    )

    res.json({
      content: templateContent
    })
  } catch (error) {
    next(error)
  }
}
