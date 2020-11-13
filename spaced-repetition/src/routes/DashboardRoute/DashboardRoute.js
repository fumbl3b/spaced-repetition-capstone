import React, { Component } from 'react'
import config from '../../config'
import TokenService from '../../services/token-service'
import './DashboardRoute.css'

class DashboardRoute extends Component {
  state = {
    language: {},
    words: [],
  };

  componentDidMount() {
    return fetch(`${config.API_ENDPOINT}/language`, {
      headers: {
        authorization: `bearer ${TokenService.getAuthToken()}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((e) => Promise.reject(e));
        }
        return res.json();
      })
      .then((data) => {
        this.setState({
          language: data.language,
          words: data.words,
        });
      })
      .catch((error) => {
        console.error({ error });
      });
  }

  listWords() {
    let language = this.state.language.name;
    return this.state.words.map((item, idx) => {
      return (
        <li key={idx} className='word'>
          {/* <p>{language}</p> */}
          <h4 className='foreign'>{item.original}</h4>
          <p>correct answer count: {item.correct_count}</p>
          <p>incorrect answer count: {item.incorrect_count}</p>
        </li>
      );
    });
  }

  render() {
    const language = this.state.language.name;
    let score = this.state.language.total_score;

    return (
      // <main>
      <section>
        <div className='container'>
          <h2>Let's learn {language}</h2>
          <h4>Total correct answers: {score} </h4>
          <a href="/learn">Start practicing</a>
          <h3>Words to practice</h3>
        <ul className='word-container'>
          {this.listWords()}
        </ul>
        </div>
      </section>
      // </main>
    );
  }
}

export default DashboardRoute
