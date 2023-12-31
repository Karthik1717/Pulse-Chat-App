import React, { useState } from "react";
import {
	Button,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	VStack,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
	const [password, setPassword] = useState();
	const [email, setEmail] = useState();
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const history = useHistory();

	const { setUser } = ChatState();

	const submitHandler = async () => {
		setLoading(true);
		if (!email || !password) {
			toast({
				title: "Please Fill all the Fields",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}
		try {
			const config = {
				headers: {
					"Content-type": "application/json",
				},
			};

			const { data } = await axios.post(
				"/api/user/login",
				{ email, password },
				config
			);
			setUser(data);
			toast({
				title: "Login Successful",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});

			localStorage.setItem("userInfo", JSON.stringify(data));
			// setLoading(false);

			history.push("/chats");
		} catch (err) {
			toast({
				title: "Error Occured",
				status: "error",
				description: err.response.data.message,
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
		}
	};

	return (
		<VStack spacing='5px'>
			<FormControl id='email' isRequired>
				<FormLabel> Email </FormLabel>
				<Input
					placeholder='Enter Your Email'
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
				/>
			</FormControl>
			<FormControl id='password' isRequired>
				<FormLabel> Password </FormLabel>
				<InputGroup>
					<Input
						type={show ? "text" : "Password"}
						placeholder='Enter Your Password'
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
						}}
					/>
					<InputRightElement width='4.5rem'>
						<Button
							h='1.75rem'
							size='sm'
							onClick={() => setShow(!show)}
							colorScheme='teal'
						>
							{show ? "Hide" : "Show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>

			<Button
				colorScheme='teal'
				width='100%'
				style={{ marginTop: 15 }}
				onClick={submitHandler}
				isLoading={loading}
			>
				Login
			</Button>
			<Button
				variant='solid'
				colorScheme='pink'
				width='100%'
				style={{ marginTop: 15 }}
				onClick={() => {
					setEmail("guest@example.com");
					setPassword("123456");
				}}
			>
				Get Guest User Credentials
			</Button>
		</VStack>
	);
};

export default Login;
