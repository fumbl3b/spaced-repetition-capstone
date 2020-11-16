const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const { json } = require('express')


const languageRouter = express.Router()
const jsonBodyParser = express.json()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const word = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id
      ).first()

      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id
      )

      res.json({
        nextWord: word.original,
        pronounciation: word.pronounciation,
        totalScore: language.total_score,
        wordCorrectCount: word.correct_count,
        wordIncorrectCount: word.incorrect_count
      })
      next()
    } catch (error) {
      next(error)
    }

  })

languageRouter
.post('/guess', jsonBodyParser, async (req, res, next) => {
  try{
    const { guess } = req.body;
  
    if(!guess) {
      return res.status(400).json({
        error: `Missing 'guess' in request body`
      })
    }
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    )
    const newList = LanguageService.generateList(req.language, words);
  
    const node = newList.head;
    const answer = node.value.translation;
  
    let isCorrect;
  
    if(guess === answer) {
      isCorrect = true;
  
      newList.head.value.memory_value = Number(node.value.memory_value) * 2;
      newList.head.value.correct_count = Number(newList.head.value.correct_count) + 1;
  
      newList.total_score = Number(newList.total_score) + 1;
    } else {
      isCorrect = false;
  
      newList.head.value.memory_value = 1;
      newList.head.value.incorrect_count = Number(newList.head.value.incorrect_count) + 1
    }
  
    newList.moveHead(newList.head.value.memory_value);
  
    await LanguageService.updateLanguageEntry(
      req.app.get('db'),
      newList
    )
  
    await LanguageService.updateWordEntry(
      req.app.get('db'),
      newList
    )
    res.json({
      nextWord: newList.head.value.original,
        wordCorrectCount: newList.head.value.correct_count,
        wordIncorrectCount: newList.head.value.incorrect_count,
        totalScore: newList.total_score,
        answer,
        isCorrect
    })
    next()
  } catch (error) {
    next(error)
  }
})

module.exports = languageRouter
