'use client';
import { ChakraProvider, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,  
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { HSeparator } from 'components/separator/Separator';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation'

// Define the form data interface
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePicture: string;
}

// Define the API response interface
interface ApiResponse {
  status: string;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      profilePicture: string;
    };
  };
  errors?: {
    email?: {
      message: string;
      type: string;
      field: string;
    };
  };
}

function SignUpContent() {
  const router = useRouter();
  const textColor = useColorModeValue('white', 'white');
  const textColorSecondary = 'gray.400';
  const textColorDetails = useColorModeValue('navy.700', 'secondaryGray.600');
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const googleBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.200');
  const googleText = useColorModeValue('navy.700', 'white');
  const googleHover = useColorModeValue(
    { bg: 'gray.200' },
    { bg: 'whiteAlpha.300' },
  );
  const googleActive = useColorModeValue(
    { bg: 'secondaryGray.300' },
    { bg: 'whiteAlpha.200' },
  );
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: 'https://avatar.iran.liara.run/public/girl', // Hardcoded profile picture URL
  });
  const toast = useToast();

  const handleClick = () => setShow(!show);

  useEffect(() => {
      // Redirect to profile if token exists
      const token = localStorage.getItem('authToken');
      if (token) {
        router.push('/admin/profile');
      }
    }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
  
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }
  
    // Prepare payload
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      profilePicture: formData.profilePicture, // Hardcoded URL
    };
  
    try {
      const response = await fetch('https://harassment-saver-extension.onrender.com/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const data: ApiResponse = await response.json();
  
      if (!response.ok) {
        throw new Error(data.errors?.email?.message || 'Registration failed');
      }
  
      // Save token to local storage
      if (data.data?.token) {
        localStorage.setItem('authToken', data.data.token); // Save token
      }
  
      // Success
      toast({
        title: 'Success',
        description: 'Account created successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
  
      // Redirect or perform other actions
      console.log('User registered:', data.data?.user);
  
      // Example: Redirect to dashboard
      router.push('/dashboard'); // If using Next.js router
  
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minHeight="100vh" width="100%" justify="center" align="center">
      <Flex
        maxW={{ base: '100%', md: '420px' }}
        w="100%"
        mx="auto"
        p={{ base: '25px', md: '0px' }}
        direction="column"
      >
        <Box mb="10">
          <Heading color={textColor} fontSize="36px" mb="10px" textAlign="center">
            Sign Up
          </Heading>
          <Text
            mb="36px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
            textAlign="center"
          >
            Create an account to get started!
          </Text>
        </Box>
        {/* Use a `form` element instead of `Flex` for the form container */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            background: 'transparent',
            borderRadius: '15px',
            marginBottom: '20px',
          }}
        >
          <Flex direction="column" w="100%">
            <Button
              fontSize="sm"
              me="0px"
              mb="26px"
              py="15px"
              h="50px"
              borderRadius="16px"
              bgColor={googleBg}
              color={googleText}
              fontWeight="500"
              _hover={googleHover}
              _active={googleActive}
              _focus={googleActive}
            >
              <Icon as={FcGoogle} w="20px" h="20px" me="10px" />
              Sign up with Google
            </Button>
            <Flex align="center" mb="25px">
              <HSeparator />
              <Text color="gray.400" mx="14px">
                or
              </Text>
              <HSeparator />
            </Flex>
            <FormControl>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Name<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired={true}
                variant="auth"
                fontSize="sm"
                type="text"
                placeholder="Enter your name"
                mb="24px"
                fontWeight="500"
                size="lg"
                name="name"
                value={formData.name}
                onChange={handleChange}
                color={textColor}
              />
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired={true}
                variant="auth"
                fontSize="sm"
                type="email"
                placeholder="mail@example.com"
                mb="24px"
                fontWeight="500"
                size="lg"
                name="email"
                value={formData.email}
                onChange={handleChange}
                color={textColor}
              />
              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                Password<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired={true}
                  fontSize="sm"
                  placeholder="Min. 8 characters"
                  mb="24px"
                  size="lg"
                  type={show ? 'text' : 'password'}
                  variant="auth"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  color={textColor}
                />
                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: 'pointer' }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>
              <FormLabel
                ms="4px"
                fontSize="sm" 
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                Confirm Password<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired={true}
                  fontSize="sm"
                  placeholder="Confirm your password"
                  mb="24px"
                  size="lg"
                  type={show ? 'text' : 'password'}
                  variant="auth"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  color={textColor}
                />
                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: 'pointer' }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>
              <Flex justifyContent="space-between" align="center" mb="24px">
                <FormControl display="flex" alignItems="center">
                  {/* <Checkbox
                    id="terms-and-conditions"
                    colorScheme="brandScheme"
                    me="10px"
                    isRequired
                  />
                  <FormLabel
                    htmlFor="terms-and-conditions"
                    mb="0"
                    fontWeight="normal"
                    color={textColor}
                    fontSize="sm"
                  >
                    I agree to the terms and conditions
                  </FormLabel> */}
                </FormControl>
              </Flex>
              <Button
                fontSize="sm"
                variant="brand"
                fontWeight="500"
                w="100%"
                h="50"
                mb="24px"
                type="submit"
                isLoading={isLoading}
              >
                Sign Up
              </Button>
            </FormControl>
            <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              maxW="100%"
              mt="0px"
            >
              <Text color={textColorDetails} fontWeight="400" fontSize="14px">
                Already have an account?
                <Link href="/auth/sign-in">
                  <Text
                    color={textColorBrand}
                    as="span"
                    ms="5px"
                    fontWeight="500"
                  >
                    Sign In
                  </Text>
                </Link>
              </Text>
            </Flex>
          </Flex>
        </form>
      </Flex>
    </Flex>
  );
}

export default function SignUp() {
  return (
    <ChakraProvider>
      <SignUpContent />
    </ChakraProvider>
  );
}