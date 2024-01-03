import {
	Avatar,
	Box,
	Button,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Input,
	Menu,
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuList,
	Spinner,
	Text,
	Tooltip,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../User Avatar/UserListItem";
import { getSender } from "../../config/ChatLogics";

const SideDrawer = () => {
	const [search, setSearch] = useState("");
	const [searchResults, setSearchResult] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingChat, setLoadingChat] = useState();

	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();

	const {
		user,
		setSelectedChat,
		chats,
		setChats,
		notification,
		setNotification,
	} = ChatState();
	const history = useHistory();

	const logoutHandler = () => {
		localStorage.removeItem("userInfo");
		history.push("/");
	};

	const handleSearch = async () => {
		if (!search) {
			toast({
				title: "Please Enter Somthing in Search",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top-left",
			});
		}

		try {
			setLoading(true);

			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};

			const { data } = await axios.get(
				`/api/user?search=${search}`,
				config
			);

			console.log(data, "data444");

			setLoading(false);
			setSearchResult(data);
		} catch (err) {
			toast({
				title: "Error Occured!",
				description: "Failed to load the Search Results",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
		}
	};

	const accessChat = async (userId) => {
		try {
			setLoadingChat(true);
			const config = {
				headers: {
					"Content-type": "application/json",
					Authorization: `Bearer ${user.token}`,
				},
			};
			const { data } = await axios.post("/api/chat", { userId }, config);
			if (!chats?.find((c) => c._id === data._id))
				setChats([data, ...chats]);
			setSelectedChat(data);
			setLoadingChat(false);
			onClose();
		} catch (err) {
			toast({
				title: "Error fetching the chat!",
				description: err.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
		}
	};

	return (
		<>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				bg='white'
				w='100%'
				p='5px 10px 5px 10px'
				borderWidth='5px'
				borderColor='#E8E8E8'
			>
				<Tooltip
					label='Search Users to chat'
					hasArrow
					placement='bottom-end'
				>
					<Button
						variant='ghost'
						onClick={onOpen}
						background='#E8E8E8'
					>
						<i className='fas fa-search'></i>
						<Text display={{ base: "none", md: "flex" }} px='4'>
							Search User
						</Text>
					</Button>
				</Tooltip>

				<Text fontSize='2xl' fontFamily='Work sans'>
					Pulse
				</Text>
				<div>
					<Menu>
						<MenuButton p={1}>
							{notification.length > 0 && (
								<div className='notification-badge'>
									<span className='badge'>
										{notification.length}
									</span>
								</div>
							)}

							<BellIcon fontSize='3xl' m={1} marginRight={5} />
						</MenuButton>
						<MenuList pl={2}>
							{!notification.length && "No New Messages"}
							{notification.map((notif) => (
								<MenuItem
									key={notif._id}
									onClick={() => {
										setSelectedChat(notif.chat);
										setNotification(
											notification.filter(
												(n) => n !== notif
											)
										);
									}}
								>
									{notif.chat.isGroupChat
										? `New Message in ${notif.chat.chatName}`
										: `New Message from ${getSender(
												user,
												notif.chat.users
										  )}`}
								</MenuItem>
							))}
						</MenuList>
					</Menu>
					<Menu>
						<MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
							<Avatar
								size='sm'
								cursor='pointer'
								name={user.name}
								src={user.pic}
							/>
						</MenuButton>
						<MenuList>
							<ProfileModal user={user}>
								<MenuItem>My Profile</MenuItem>
							</ProfileModal>
							<MenuDivider />
							<MenuItem onClick={logoutHandler}>Logout</MenuItem>
						</MenuList>
					</Menu>
				</div>
			</Box>
			<Drawer placement='left' onClose={onClose} isOpen={isOpen}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerHeader borderBottomWidth='1px' background='#E8E8E8'>
						Search Users
					</DrawerHeader>
					<DrawerBody>
						<Box display='flex' paddingBottom='2px'>
							<Input
								placeholder='Search by name or email'
								mr={2}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							<Button onClick={handleSearch}>Go</Button>
						</Box>
						{loading ? (
							<ChatLoading />
						) : (
							searchResults?.map((user) => (
								<UserListItem
									key={user._id}
									user={user}
									handleFunction={() => accessChat(user._id)}
								/>
							))
						)}

						{loadingChat && <Spinner ml='auto' display='flex' />}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
};

export default SideDrawer;
