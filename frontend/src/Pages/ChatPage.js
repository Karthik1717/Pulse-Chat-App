import React, { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { Box } from "@chakra-ui/react";
import SideDrawer from "../Components/Miscellaneous/SideDrawer";
import MyChats from "../Components/MyChats";
import ChatBox from "../Components/ChatBox";

const Chats = () => {
	const { user } = ChatState();
	const [fetchAgain, setFetchAgain] = useState(false);
	return (
		<div style={{ width: "100%" }}>
			{user && <SideDrawer />}
			<Box
				display='flex'
				justifyContent='space-between'
				w='100%'
				h='91.5vh'
				p='10px'
			>
				{user && (
					<MyChats
						fetchAgain={fetchAgain}
						setFetchAgain={setFetchAgain}
					/>
				)}
				{user && (
					<ChatBox
						setFetchAgain={setFetchAgain}
						fetchAgain={fetchAgain}
					/>
				)}
			</Box>
		</div>
	);
};

export default Chats;
