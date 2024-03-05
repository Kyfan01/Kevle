import ConnectionWordTile from './ConnectionWordTile/ConnectionWordTile'
import './ConnectionBoard.css'
import { useState, useEffect } from 'react'
import ConnectionAnswerBar from './ConnectionAnswerBar/ConnectionAnswerBar'

export function ConnectionBoard({ connection }) {

    const [numWrongGuesses, setNumWrongGuesses] = useState(0)

    // Tracks game state, gameState[0] represents first row. If gameState[i] === 0, row is unsolved.
    // If [2,4,0,0], shows incomplete game where 2nd category solved first, 4th category solved second.
    const [gameState, setGameState] = useState([0, 0, 0, 0])

    // Tracks whether the game is won, lost, or being played
    const [gameStatus, setGameStatus] = useState('playing')

    // Selected words for each guess, need four words to submit
    const [guessArr, setGuessArr] = useState([])

    // Contains the randomized answers
    const [shuffledArr, setShuffledArr] = useState([])

    // Copy of shuffledArr to be mutated for display
    const [displayArr, setDisplayArr] = useState([])

    // Returns a randomized copy of the input array
    function shuffle(arr) {
        if (arr) {
            const returnArr = arr.slice(0)
            for (let i = returnArr.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1))
                let temp = returnArr[i]
                returnArr[i] = returnArr[j]
                returnArr[j] = temp
            }
            return returnArr
        }
    }

    // Initialize a shuffled array to be stored in state
    useEffect(() => {
        setShuffledArr(shuffle(connection.answers))
    }, [connection])

    // Updates the displayed elements on re-render
    const answerArr = connection.answers
    useEffect(() => {
        // Check the gameState to see which categories have been solved and thus which words to filter out of the display
        let filteredWordsArr = []
        function filteredWords() {
            if (gameState.includes(1)) filteredWordsArr.push(...answerArr.slice(0, 4))
            if (gameState.includes(2)) filteredWordsArr.push(...answerArr.slice(4, 8))
            if (gameState.includes(3)) filteredWordsArr.push(...answerArr.slice(8, 12))
            if (gameState.includes(4)) filteredWordsArr.push(...answerArr.slice(12, 16))

            return filteredWordsArr
        }
        filteredWords()

        // Sets the display array to only contain words from unsolved categories
        if (!shuffledArr) return
        setDisplayArr(shuffledArr.filter(word => !(filteredWordsArr.includes(word))))
    }, [connection, shuffledArr, gameState, answerArr, guessArr, numWrongGuesses])

    // Check game status
    useEffect(() => {
        // Game is won once the final row is solved
        if (gameState[3] > 0) {
            setGameStatus('won')
            alert('YOU WON (This will be replaced by a modal)')
        }

        // Game is lost when the number of incorrect guesses reaches 4
        if (numWrongGuesses >= 4) {
            const unsolvedCategories = [4, 3, 2, 1].filter(num => !(gameState.includes(num)))

            // Iterate through each row in gameState
            for (let i = 0; i < gameState.length; i++) {
                // For each unsolved row, remove the next easiest category from the unsolved categories and update gameState to display that category in that row
                if (gameState[i] === 0) {
                    const newGameState = gameState
                    newGameState[i] = unsolvedCategories.pop()
                    setGameState[newGameState]
                }
            }
            // Clear guess, set game status to lost
            setGuessArr([])
            setGameStatus('lost')
            alert('UH OH, YOU LOST (This will be replaced by a modal)')
            return
        }
    }, [gameState, numWrongGuesses])

    // Style answer bar
    // Win/loss modals
    // how to play modal

    if (!answerArr) return

    if (!connection.categories) return

    const connectionArr = connection.categories

    // Stores [categoryNumber, category, answer1, answer2, answer3, answer4] to pass into ConnectionAnswerBar
    const categoryObj = {}
    categoryObj.category1 = [1, connectionArr[0]].concat(answerArr?.slice(0, 4))
    categoryObj.category2 = [2, connectionArr[1]].concat(answerArr?.slice(4, 8))
    categoryObj.category3 = [3, connectionArr[2]].concat(answerArr?.slice(8, 12))
    categoryObj.category4 = [4, connectionArr[3]].concat(answerArr?.slice(12, 16))

    // Stores sets containing each group of answers for comparison to guesses
    const answerObj = {}
    answerObj[1] = new Set(answerArr.slice(0, 4))
    answerObj[2] = new Set(answerArr.slice(4, 8))
    answerObj[3] = new Set(answerArr.slice(8, 12))
    answerObj[4] = new Set(answerArr.slice(12, 16))

    const submitGuess = e => {
        e.preventDefault()
        // Iterate through each of the 4 rows to check for completion
        for (let i = 0; i < 4; i++) {
            // If the current row is incomplete
            if (gameState[i] === 0) {
                // Iterate through each of the 4 sets of answers
                for (let answerSetNum in answerObj) {
                    // Check if the guess matches any of the answer sets
                    if (guessArr.every(word => answerObj[answerSetNum].has(word))) {
                        // Update gamestate if there's a match
                        const newGameState = [...gameState]
                        newGameState[i] = parseInt(answerSetNum)
                        setGameState(newGameState)

                        // Clear the guess
                        setGuessArr([])
                        return
                    }
                }
            }
        }
        // Increment the number of incorrect guesses if there's no match
        let guesses = numWrongGuesses + 1
        setNumWrongGuesses(guesses)
    }

    return (
        <div className='connection-board-container'>
            {console.log(connection.answers)}
            <div className='connection-board-row'>
                {gameState[0] > 0 && <ConnectionAnswerBar category={categoryObj[`category` + gameState[0]]} />}
                {gameState[0] === 0 && displayArr?.splice(0, 4)?.map(word => (<ConnectionWordTile key={word} word={word} setGuessArr={setGuessArr} guessArr={guessArr} />))}
            </div>
            <div className='connection-board-row'>
                {gameState[1] > 0 && <ConnectionAnswerBar category={categoryObj[`category` + gameState[1]]} />}
                {gameState[1] === 0 && displayArr?.splice(0, 4)?.map(word => (<ConnectionWordTile key={word} word={word} setGuessArr={setGuessArr} guessArr={guessArr} />))}
            </div>
            <div className='connection-board-row'>
                {gameState[2] > 0 && <ConnectionAnswerBar category={categoryObj[`category` + gameState[2]]} />}
                {gameState[2] === 0 && displayArr?.splice(0, 4)?.map(word => (<ConnectionWordTile key={word} word={word} setGuessArr={setGuessArr} guessArr={guessArr} />))}
            </div>
            <div className='connection-board-row'>
                {gameState[3] > 0 && <ConnectionAnswerBar category={categoryObj[`category` + gameState[3]]} />}
                {gameState[3] === 0 && displayArr?.splice(0, 4)?.map(word => (<ConnectionWordTile key={word} word={word} setGuessArr={setGuessArr} guessArr={guessArr} />))}
            </div>

            <div className='connection-board-button-container'>
                <p>{4 - numWrongGuesses} Lives Remaining</p>
                <button onClick={() => setShuffledArr(shuffle(connection.answers))} className={`connection-board-button`} id={gameStatus === 'playing' ? "" : "no-click"}>Shuffle</button>
                <button onClick={() => setGuessArr([])} className={`connection-board-button`} id={guessArr.length > 0 ? "" : "no-click"}>Deselect All</button>
                <button onClick={submitGuess} className={`connection-board-button`} id={guessArr.length === 4 ? "" : "no-click"}>Submit</button>
            </div>
        </div>
    )
}

export default ConnectionBoard
