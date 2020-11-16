import { faTheaterMasks } from '@fortawesome/free-solid-svg-icons'
import React, { Component } from 'react'
import config from '../../config'
import TokenService from '../../services/token-service'

class LearningRoute extends Component {
  state = {
    head:{},
    guess: '',
    displayResult: false,
    res: {},
    totalScore: 0,
    init: true
  }

  fetchHead = () => {
    return fetch(`${config.API_ENDPOINT}/language/head`, {
      headers: {
        authorization: `bearer ${TokenService.getAuthToken()}`
      }
    })
    .then((res) => {
      if(!res.ok) {
        return res.json().then((e) => Promise.reject(e));
      }
      return res.json();
    })
    .then(resJson => {
      this.setState({
        head: resJson,
        totalScore: resJson.totalScore //there may be an issue here
      })
    })
  }

  updateGuess = e => {
    this.setState({
      guess: e.target.value
    })
  }

  submitGuess = e => {
    e.preventDefault()
    let guess = this.state.guess
    let res = this.state.res
    this.postGuess(guess)
      .then(() => {
        if (guess !== res.answer) {
          this.setState({
            displayResult: true,
            totalScore: res.totalScore
          })
        }
      })
  }

  postGuess = (guess) => {
    let guessObject = JSON.stringify({ guess })
    return fetch(`${config.API_ENDPOINT}/language/guess`, {
      method: "POST",
      headers: {
        authorization: `bearer ${TokenService.getAuthToken()}`,
        'content-type': "application/json"
      },
      body: guessObject
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then((e) => Promise.reject(e))
      }
      return res.json()
    })
    .then(resJson => {
      this.setState({
        res: resJson,
        totalScore: resJson.totalScore
      })
    })
    .catch(error => {
      console.error({ error })
    })
  }

  generateWord = () => {
    if (this.state.init === true) {
      this.setState({
        init: false
      })
      this.fetchHead()
    }

    let data = this.state.head
    
    if (this.state.displayResult === false) {
      return (
        <div>
          <div className='word'>
          <h2>Translate the word:</h2>
          <span>{data.nextWord}</span><br/>
          <span>{data.nextPronounciation}</span>
          <br/>
          </div>
          <form onSubmit={this.submitGuess}>
              <label htmlFor='learn-guess-input'>What's the translation for this word?</label>
              <input id='learn-guess-input' type='text' onChange={this.updateGuess} required></input>
              <button type='submit'>Submit your answer</button>
            </form>
          <p>Your total score is: {data.totalScore}</p>
          <main>
            <p>You have answered this word correctly {data.wordCorrectCount} times.</p>
            <p>You have answered this word incorrectly {data.wordIncorrectCount} times.</p>
            
          </main>
        </div>
      )
    } else {
      return (
        <main>
          <form onSubmit={this.updateDisplay}>
            {this.displayWrong()}
          </form>
        </main>
      )
    }
  }

  updateDisplay = (e) => {
    this.setState({
      displayResult: false,
      head: this.state.res
    })
  }

  displayWrong = () => {
    if(this.state.displayResult === true) {
      if(this.state.res.isCorrect === false) {
        return (
          <div>
            <main className='DisplayScore'>
              <p>Your total score is: {this.state.res.totalScore}</p>
              <h2>Good try, but not quite right :(</h2>
            </main>
            <div className='DisplayFeedback'>
              <p>The correct translation for {this.state.head.nextWord} {this.state.head.pronounciation} was {this.state.res.answer} and you chose {this.state.guess}!</p>
            </div>
            <button>Try another word!</button>
          </div>
        )
      } else {
        return (
          <div>
            <main className='DisplayScore'>
              <p>Your total score is: {this.state.res.totalScore}</p>
              <h2>You were correct! :D</h2>
            </main>
            <div className='DisplayFeedback'>
              <p>The correct translation for {this.state.head.nextWord} {this.state.head.pronounciation} was {this.state.res.answer} and you chose {this.state.guess}!</p>
            </div>
            <button>Try another word!</button>
          </div>
        )
      }
    } else {
      return ''
    }
  }

  render() {
    return (
      <section>
        {this.generateWord()}
      </section>
    );
  }
}

export default LearningRoute
