import React from "react";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

class OpadEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            text: 'hello'
        }
        this.handleInput = this.handleInput.bind(this)
    }

    handleInput(value) {
        this.setState({text: value})
    }

    render() {

        return (
        <div className="OpadEditor">
            <Editor
            className="Editor"
            value={this.state.text}
            onValueChange={this.handleInput}
            highlight={code => highlight(code, languages.js)}
            padding={10}
            style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            }}
        />
        </div>
        );
    }
}
 
export default OpadEditor;