import './App.scss';
import React from 'react';
import Editor from './Components/OpadEditor';

class App extends React.Component {
  render() { 
    return (
      <div className="App">
        <header className="App-header"> 
        <img src="full_logo.png" />  
        {/* OPad Client */}
        </header>
        <Editor />
      </div>
    );
  }
}
 
export default App;

