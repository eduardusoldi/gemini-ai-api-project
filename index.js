import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'
const port = 3000

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const genAI = new GoogleGenerativeAI(process.env.API_KEY)

const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" })

// Multer
const upload = multer({ dest: 'uploads' })

// API Generate Text
app.post('/generate-text', upload.none(), async (req, res) => {
    const  prompt  = req.body.prompt
    console.log(prompt)
    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        res.json({ output: response.text() })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// API Generate From Image
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const filePath = req.file.path
    const buffer = fs.readFileSync(filePath)
    const base64Data = buffer.toString('base64')
    const mimeType = req.file.mimetype

    try {
        const imagePart = {
            inlineData: { data: base64Data, mimeType }
        }

        const result = await model.generateContent(['Analyze this document', imagePart])
        const response = await result.response

        res.json({ output: response.text() })
    } catch (error) {
        res.status(500).json({ error: error.message })
    } finally {
        fs.unlinkSync(filePath)
    }
})

// API Generate From Document
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const filePath = req.file.path
    const buffer = fs.readFileSync(filePath)
    const base64Data = buffer.toString('base64')
    const mimeType = req.file.mimetype

    try {
        const documentPart = {
            inlineData: { data: base64Data, mimeType }
        }

        const result = await model.generateContent(['Analyze this document', documentPart])
        const response = await result.response

        res.json({ output: response.text() })
    } catch (error) {
        res.status(500).json({ error: error.message })
    } finally {
        fs.unlinkSync(filePath)
    }
})

// API Generate From Audio
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const filePath = req.file.path
    const buffer = fs.readFileSync(filePath)
    const base64Data = buffer.toString('base64')
    const audioPart = {
        inlineData: {
            data: base64Data,
            mimeType: req.file.mimetype
        }
    }

    try {
        const result = await model.generateContent(['Transcribe or analyze the following audio', audioPart])
        const response = await result.response

        res.json({ output: response.text() })
    } catch (error) {
        res.status(500).json({ error: error.message })
    } finally {
        fs.unlinkSync(filePath)
    }
})


// Running port
app.listen(port, () => {
    console.log(`Running on port ${port}`)
})