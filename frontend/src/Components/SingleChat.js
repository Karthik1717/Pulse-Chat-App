import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
	Box,
	FormControl,
	IconButton,
	Input,
	Spinner,
	Text,
	useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./Miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./Miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import io from "socket.io-client";
import Lottie from "lottie-react";
import animationData from "./animations/typing.json";

import "./styles.css";
import ScrollableChat from "./ScrollableChat";

const ENDPOINT = "https://pulse-ty0v.onrender.com";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
	const {
		user,
		selectedChat,
		setSelectedChat,
		notification,
		setNotification,
	} = ChatState();
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [newMessage, setNewMessage] = useState();
	const [socketConnected, setSocketConnected] = useState(false);
	const [typing, setTyping] = useState(false);
	const [isTyping, setIsTyping] = useState(false);

	const interactivity = {
		mode: "scroll",
		actions: [
			{
				visibility: [0, 0.2],
				type: "stop",
				frames: [0],
			},
			{
				visibility: [0.2, 0.45],
				type: "seek",
				frames: [0, 45],
			},
			{
				visibility: [0.45, 1.0],
				type: "loop",
				frames: [45, 60],
			},
		],
	};

	const toast = useToast();

	const fetchMessages = async () => {
		if (!selectedChat) return;

		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};
			setLoading(true);
			const { data } = await axios.get(
				`/api/message/${selectedChat._id}`,
				config
			);
			console.log(messages);
			setMessages(data);
			setLoading(false);
			socket.emit("join chat", selectedChat._id);
		} catch (error) {
			toast({
				title: "Error Ocurred",
				description: "Failed to laod the messages",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	};

	useEffect(() => {
		socket = io(ENDPOINT);
		socket.emit("setup", user);
		socket.on("connected", () => {
			setSocketConnected(true);
		});
		socket.on("typing", () => {
			setIsTyping(true);
		});
		socket.on("stop typing", () => {
			setIsTyping(false);
		});
	}, []);

	useEffect(() => {
		fetchMessages();
		selectedChatCompare = selectedChat;
	}, [selectedChat]);

	useEffect(() => {
		socket.on("message received", (newMessageReceived) => {
			if (
				!selectedChatCompare ||
				selectedChatCompare._id !== newMessageReceived.chat._id
			) {
				if (!notification.includes(newMessageReceived)) {
					setNotification([newMessageReceived, ...notification]);
					setFetchAgain(!fetchAgain);
				}
			} else {
				setMessages([...messages, newMessageReceived]);
			}
		});
	});

	const sendMessage = async (event) => {
		if (event.key === "Enter" && newMessage) {
			socket.emit("stop typing", selectedChat._id);
			try {
				const config = {
					headers: {
						"Content-type": "application/json",
						Authorization: `Bearer ${user.token}`,
					},
				};
				setNewMessage("");
				const { data } = await axios.post(
					"/api/message",
					{
						content: newMessage,
						chatId: selectedChat,
					},
					config
				);
				socket.emit("new message", data);
				setMessages([...messages, data]);
			} catch (error) {
				toast({
					title: "Error Occured!",
					description: "Failed to send the Message",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				});
			}
		}
	};

	const typingHandler = (e) => {
		setNewMessage(e.target.value);

		// Typing Indictor
		if (!socketConnected) return;
		if (!typing) {
			setTyping(true);
			socket.emit("typing", selectedChat._id);
		}

		let lastTypingTime = new Date().getTime();
		var timerLength = 3000;

		setTimeout(() => {
			var timeNow = new Date().getTime();
			var timeDiff = timeNow - lastTypingTime;
			if (timeDiff >= timerLength && typing) {
				socket.emit("stop typing", selectedChat._id);
				setTyping(false);
			}
		}, timerLength);
	};

	return (
		<>
			{selectedChat ? (
				<>
					<Text
						fontSize={{ base: "28px", md: "30px" }}
						pb={3}
						px={2}
						width='100%'
						fontFamily='Work sans'
						display='flex'
						justifyContent={{ base: "space-between" }}
						alignItems='center'
					>
						<IconButton
							display={{ base: "flex", md: "none" }}
							icon={<ArrowBackIcon />}
							onClick={() => setSelectedChat("")}
						/>
						{!selectedChat.isGroupChat ? (
							<>
								{getSender(user, selectedChat.users)}
								<ProfileModal
									user={getSenderFull(
										user,
										selectedChat.users
									)}
								/>
							</>
						) : (
							<>
								{selectedChat.chatName.toUpperCase()}
								<UpdateGroupChatModal
									fetchAgain={fetchAgain}
									setFetchAgain={setFetchAgain}
									fetchMessages={fetchMessages}
								/>
							</>
						)}
					</Text>
					<Box
						display='flex'
						flexDir='column'
						justifyContent='flex-end'
						p={3}
						bg='#E8E8E8'
						w='100%'
						h='100%'
						borderRadius='lg'
						overflowY='hidden'
					>
						{loading ? (
							<Spinner
								size='xl'
								w={20}
								h={20}
								alignSelf='center'
								margin='auto'
							/>
						) : (
							<div className='messages'>
								<ScrollableChat messages={messages} />
							</div>
						)}
						<FormControl onKeyDown={sendMessage} isRequired mt={3}>
							{isTyping ? (
								<div>
									{/* <Lottie options={defaultOptions}></Lottie> */}
									<Lottie
										style={{
											marginBottom: 15,
											marginLeft: 0,
											width: 70,
										}}
										animationData={animationData}
										loop={true}
										interactivity={interactivity}
									/>
								</div>
							) : (
								<></>
							)}
							<Input
								variant='filled'
								bg='#E0E0E0'
								placeholder='Enter a message'
								onChange={typingHandler}
								value={newMessage}
							/>
						</FormControl>
					</Box>
				</>
			) : (
				<Box
					display='flex'
					alignItems='center'
					justifyContent='center'
					height='100%'
				>
					<Text fontSize='3xl' pb={3} fontFamily='Work sans'>
						Click on an user to start chatting
					</Text>
				</Box>
			)}
		</>
	);
};

export default SingleChat;
