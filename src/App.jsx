import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import './App.css';
import { languages } from './languages';
import { getFarewellText, getRandomWord } from './utils';

function App() {
  //state values
  const [currentWord, setCurrentWord] = useState(() => getRandomWord())
  const [guessedLetters, setguessedLetters] = useState([])
  const buttonRef= useRef(null);
  const audioRef = useRef(null);

  //derived values
  const numGuessesLeft = languages.length - 1;
  const wrongGuessCount = guessedLetters.filter((letter) => !currentWord.includes(letter)).length
  const isGameWon = currentWord.split('').every(letter => guessedLetters.includes(letter))
  const isGameLost = wrongGuessCount >= numGuessesLeft;
  const isGameOver = isGameWon || isGameLost;
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const islastGuessIncorrect= lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  //static values
  const alphabet= 'abcdefghijklmnopqrstuvwxyz';

  useEffect(()=>{
    if(isGameWon) {
      buttonRef.current.focus()
      audioRef.current.play();
    }
  },[isGameWon])

  function addGuessedLetter(letter) {
    setguessedLetters(prevLetter => 
      prevLetter.includes(letter) ?
          prevLetter :
          [...prevLetter,letter]
    )
  }

  const languageElements = languages.map((lang,index) => {
    const isLanguageLost = index <wrongGuessCount
    const styles = {
      backgroundColor: lang.backgroundColor,
      color: lang.color
    }

    const className = clsx('chip', isLanguageLost && 'lost')
    return (
      <span 
          // className={`chip ${isLanguageLost? 'lost' : ''}`} 
          className={className}
          style={styles} 
          key={lang.name}
      >
        {lang.name}
      </span>
    )
  })

  const letterElements= currentWord.split('').map((letter,index)=>{
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
    const letterClassName = clsx( 
      isGameLost && !guessedLetters.includes(letter) && 'missed-letter'
    )
    return (
      <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase():''}
      </span>
    )
  })

  const keyboardElements = alphabet.split('').map((letter) => {
    const isGuessed = guessedLetters.includes(letter) 
    const isCorrect = isGuessed && currentWord.includes(letter)
    const isWrong = isGuessed && !currentWord.includes(letter)
    const className= clsx({
      correct: isCorrect,
      wrong: isWrong
    })

    return (
        <button 
            className={className}
            key = {letter} 
            disabled = {isGameOver}
            aria-disabled={guessedLetters.includes(letter)}
            aria-label={`Letter ${letter}`}
            onClick={() => addGuessedLetter(letter)}
            >
              {letter.toUpperCase()}
            </button>
      )
  })

  const gameStatusClass = clsx('game-status', {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && islastGuessIncorrect
  });

  function renderGameStatus() {
    if(!isGameOver&& islastGuessIncorrect){
      return (
        <p className='farewell-message'>
          {getFarewellText(languages[wrongGuessCount-1].name)}
        </p>
        )
    } 

    if(isGameWon) {
      return (
        <>
            <h2>You win!</h2>
            <p>Well done! 🎉</p>
        </>
      )
    } 
    if(isGameLost) {
      return (
        <>
            <h2>Game over!</h2>
            <p>You lose! Better start learning Assembly 🥺</p>
        </>
      )
    }
    return null;
  }

  function startNewGame() {
    setCurrentWord(getRandomWord())
    setguessedLetters([])
  }

  return (
    <>
    {isGameWon && (
      <>
        <Confetti/>
        {/* <Confetti recycle={false} numberOfPieces={1000}/> */}
        <audio ref={audioRef} src="/congrats.mp3" />
      </>
    )}
    <main>
      <header>
        <h1>Assembly: Endgame</h1>
        <p>Guess the word within 8 attempts to keep the 
          programming world safe from Assembly!</p>
      </header>
    </main>

    <section aria-live='polite' role='status' className={gameStatusClass}>
      {renderGameStatus()}
    </section>

    <section className='language-chips'>
      {languageElements}
    </section>

    <section className='word'>
      {letterElements}
    </section>

    <section className='sr-only' aria-live='polite' role='status'>
      <p>
        {currentWord.includes(lastGuessedLetter) ? 
        `Correct! The letter ${lastGuessedLetter} is in the word.` :
        `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
        You have {numGuessesLeft} attempts left.
      </p>

      <p>Current word: {currentWord.split('').map(letter => 
        guessedLetters.includes(letter) ? letter + '.' : 'blank')
        .join(' ')}</p>
    </section>

    <section className='keyboard'>
      {keyboardElements}
    </section>

    {isGameOver && <button  ref={buttonRef} className='new-game' onClick={startNewGame}>New Game</button>}

    </>
  )
}

export default App
