import React from "react";
import './OpadEditor.scss';
import {Close, Add} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import {Button, Icon} from '@material-ui/core';
import {Alert} from '@material-ui/lab';

class OpadEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            open_files: ['hello','file2'],
            current_file: 'hello',
            content: '|hello world\n\nhello',
            popup: false
        }
        this.getFile = this.getFile.bind(this)
        this.create = this.create.bind(this)
        this.open = this.open.bind(this)
        this.close = this.close.bind(this)
        this.selectTab = this.selectTab.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.getFile();
    }

    componentDidMount() {
        this.timer = setInterval(()=> this.getFile(), 5000);
        document.addEventListener("keydown", this.handleKeyPress);
    }
    
    componentWillUnmount() {
        clearInterval(this.timer)
        this.timer = null;
        document.removeEventListener("keydown", this.handleKeyPress);
    }
    
    getFile() {
        const axios = require('axios');
        axios.get(`http://localhost:4000/fetch-file?filename=${this.state.current_file}`)
        .then(result =>  this.setState({content: result.data.content.substr(0, result.data.cursor) + '|' + result.data.content.substr(result.data.cursor)}));
    }

    handleKeyPress(event) {
        const axios = require('axios');
        axios.get(`http://localhost:4000/key-press?filename=${this.state.current_file}&key=${event.key == ' ' ? 'Space' : event.key}`)
        .then(result =>  this.setState({content: result.data.content.substr(0, result.data.cursor) + '|' + result.data.content.substr(result.data.cursor)}));
    }

    create() {
        var filename = document.getElementById('createFileName').value
        if(filename == '') {
            this.setState({alert_severity: 'error', alert_message: 'Please enter file name'})
            return;
        }
        const axios = require('axios');
        axios.get(`http://localhost:4000/create-file?filename=${filename}`)
            .then(result =>  {
                console.log(result)
                if(result.data.status == 'success') {
                    this.setState({open_files: [...this.state.open_files, filename], current_file: filename, content: result.data.content})
                    this.setState({alert_message: `File Created Successfully. File secret key is ${result.data.key}.`, alert_severity: 'success'})
                } else {
                    this.setState({alert_message: result.data.status, alert_severity: 'error'})
                }
            });
    }

    open() {
        var filename = document.getElementById('openFileID').value
        if(filename == '') {
            this.setState({alert_severity: 'error', alert_message: 'Please enter File Secret Key'})
            return;
        }
        const axios = require('axios');
        axios.get(`http://localhost:4000/open-file?filename=${filename}`)
            .then(result =>  {
                if(result.data.status == 'success') {
                    this.setState({open_files: [...this.state.open_files, filename], current_file: filename, content: result.data.content, popup: false})
                } else {
                    this.setState({alert_message: result.data.status, alert_severity: 'error'})
                }
            });
    }

    close() {
        console.log('close');
    }

    selectTab(id) {
        this.setState({current_file : id})
    }

    render() {
        return (
        <div className="OpadEditor">
            <div className={`popup ${this.state.popup ? `open` : ``}`}>
                <IconButton className="close" onClick={() => this.setState({popup: false})}>
                    <Close />
                </IconButton>
                <div>
                    {'File Name:'}
                    <input id="createFileName" type="text" />
                </div>
               <Button className="newFile" onClick={this.create}>Create new file</Button>
                {'or'}
                <div>
                    {'File Secret Key:'}
                    <input id="openFileID" type="text" />
                </div>
                <Button className="newFile" onClick={this.open}>Open file</Button>
                {this.state.alert_severity ? <Alert severity={this.state.alert_severity}>{this.state.alert_message}</Alert> : ""}
            </div>

             <div className="tabs">
                {this.state.open_files.map((file) =>(
                    <div className={`tab ${file == this.state.current_file ? "selected" : ""}`} onClick={() => this.selectTab(file)}>
                        <div className="tab-name">{file}</div>
                        <IconButton className="close" onClick={this.close}> 
                            <Close />
                        </IconButton>
                    </div>))
                }
                <div className="tab">
                    <IconButton className="add" onClick={() => this.setState({popup : true})}> 
                        <Add />
                    </IconButton>      
                </div>                      
            </div>

           {this.state.open_files.length > 0 ? (
                <div className="body" focus >
                    {this.state.content.split('\n').map((line, id) => (
                        <div className="line">
                            <div className="lineno">{id}</div>
                            {line}
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <Button>Create new file</Button>
                    <Button>Open file</Button>
                </div>
            )}
        </div>
        );
    }
}
 
export default OpadEditor;