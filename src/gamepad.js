import React from 'react'

import basePage from './basePage.js'

import './css/styles.css'

/*	React Gamepad-API Implementation for Rpanion / Ardupilot

This allows for the manual control of ardupilot vehicle
through rpanion-server with any gamepad-api compatible device.

# Plan

+=active, ~=beta

YAH		async 'state.elements' for displaying controller values in "table"

~			client	gamepadConnect				eventListener:gamepadConnected
~			client	gamepadDisconnect			eventListener:gamepadDisconnect
TODO  server	gamepadConfigSave			write controller to gamepad
TODO  server	gamepadConfigLoad			read controller from gamepad
~     client  gamepadConfigCreate   create blank controller profile
~   	client	gamepadEventLoop			poll gamepad-api every EventLoopRate
+			client	gamepadIO							input:gamepad-api		middle:gamepad-controller output:gamepadSend(target,x,y,z,r)
TODO	client	gamepadSend						to_server:gamepadRecv
TODO	client	setMavMode						to_server:setMavMode
TODO	server	setMavMode						https://github.com/stephendade/Rpanion-server/blob/1c240fd31b0a8c8d15cf0602b035e41ce31a967a/mavlink/mavlink_ardupilot_v2.js#L5489
TODO	server	setMavManualControl		https://github.com/stephendade/Rpanion-server/blob/1c240fd31b0a8c8d15cf0602b035e41ce31a967a/mavlink/mavlink_ardupilot_v2.js#L7318
TODO	server	gamepadRecv						input:gamepadSend			output:setMavManualControl
TODO	Demo
TODO	beta release
TODO	@stephen code review
TODO	incorporate review changes
TODO	RC1 release
TODO	documentation
TODO	test suite
TODO	merge with rpanion-server master
TODO	upstream maintain issues / bugs

TODO	encaspulate and make "global context"
TODO	multiple gamepads

# Structures

state:
	gamepad				Gamepad-Api object				https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API
	controller			defined controller array
	eventLoop			gamepadIO event loop.
	eventLoopRate		update rate in milliseconds
}
controller[index].
	id					As recv from gamepad.id
	name				User defined 'human' title
	channel[0..16].
		aptarget		Current assigned ardupilot target
		name			Channel 'human' name
		source			x,y,z,r | pitch,roll,thrust,yaw | elevator,ailerons,thrust,rudder
		weight
		min				-1000
		max				1000
		val				current channel value.
*/

function toFixedDec(num){
  var pow = Math.pow(10||10, 0)
  return Math.round(num*pow) / pow
} 

export default class Gamepad extends basePage {
  constructor(props) {
    super(props)
    this.state = {
      gamepad: [],		
      controller:	[],
      eventLoopRate: 1000,
      loading: false,
      waiting: false,
      error: null,
      infoMessage: null
    }
  }

  gamepadConnect = (event) => {
    //	BUG		verify controller not in buffer, chrome/brave seem ok but firefox hmmm.
    this.setState({
      gamepad: [ ...this.state.gamepad, event.gamepad ]
    })
    //	YAH		this.gamepadControllerLoad(event.gamepad)
    this.gamepadConfigCreate(event.gamepad)
    this.gamepadEventLoop(this.state.gamepad[0])
    console.log("Gamepad Connected: ", event.gamepad)
  }    

  gamepadDisconnect = (event) => {
    clearInterval(this.state.eventLoop)
    const gamepad = this.state.gamepad.filter(gamepad => gamepad.id !== event.gamepad.id)
    this.setState({
      gamepad: gamepad 
    })
    console.log("Gamepad Disconnect: ", event.gamepad.id)
  }

  gamepadEventLoop = (gamepad) => {
    this.state.eventLoop = setInterval(() => (this.gamepadIO(gamepad)), this.state.eventLoopRate)
    console.log('Gamepad Streaming.')
  }

  gamepadIO = (gamepad) => {
    var i = 0
    var _debug = ''
    for(i=0; i < gamepad.axes.length; i++) {
      var v = toFixedDec(gamepad.axes[i] * 1000)
      this.state.controller[0].channel[i].value = v
      _debug += ' '+v.toFixed()
    }
    //	YAH		this.gamepadSend(x,y,z,r)
    console.log('Debug: ', _debug)
    console.log('Controller: ', this.state.controller[0].channel)
  }

  gamepadConfigGet = (controller) => {
  }

  gamepadConfigSet = (controller) => {
  }

  gamepadConfigCreate = (gamepad) => {
    var controller = {
      id: gamepad.id,
      name: '',
      aptarget: null,
      channel: []
    }
    this.setState({
      controller: [...this.state.controller, controller]
    })
    var i = 0
    for(i=0; i < gamepad.axes.length; i++) {
      var channel = {
	name: '',
	src: '', 
	weight: 100,
	min: -1000,
	max: 1000
      }
      this.state.controller[0].channel = [...this.state.controller[0].channel, channel]
    }
    console.log("GamepadConfigCreated: ", this.state.controller[0])
  }

  setMavManualControl = (x,y,z,r) => {
    console.log('test')
  }

  componentDidMount() {
    window.addEventListener("gamepadconnected", this.gamepadConnect)
    window.addEventListener("gamepaddisconnected", this.gamepadDisconnect)
    this.loadDone()
  }

  componentWillUnmount() {
    clearTimeout(this.state.eventLoop)
    this.gamepadDisconnect()
  }

  renderTitle() {
    return "Gamepad"
  }

  renderControllerChannelData(controller) {
    console.log('Controller: ', typeof controller)
    if(typeof controller !== 'undefined') {
      return controller.channel.map((output, index) => {
	return (
	  <tr key={index}>
	  <td>{(index + 1)}</td>
	  <td>{output.name}</td>
	  <td>{output.src}</td>
	  <td>{output.weight}</td>
	  <td>{output.min}</td>
	  <td>{output.max}</td>
	  <td>{output.val}</td>
	  </tr>
	)
      })
    }
  }

  // renderContent() {
  // return (
  // <div>
  // <div style={{ display: (this.state.controller[0].id !== null) ? "block" : "none"}}>
  // <p>Controller channel assignment and configuration</p>
  // <Table id='gamepad-controller' striped bordered hover size="sm">
  // <thead>
  // <tr><th>Channel</th><th>Name</th><th>Source</th><th>Weight</th><th>Min</th><th>Max</th><th>Value</th></tr>
  // {this.renderControllerChannelData(this.state.controller)}
  // </thead>
  // <tbody>
  // </tbody>
  // </Table>
  // </div>
  // <div style={{ display: (this.state.controller[0].id === null) ? "block" : "none"}}>
  // <p>Please move an axes on the controller, to connect.</p>
  // </div>
  // </div>
  // )
  // }

  renderContent() {
    return (
      <div>
      </div>
    )
  }
}
