import { Button } from "@chakra-ui/react";
import "./App.css";
import { Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Chats from "./Pages/ChatPage";

function App() {
	return (
		<div className='App'>
			<Route path='/' component={Homepage} exact />
			<Route path='/chats' component={Chats} />
		</div>
	);
}

export default App;
