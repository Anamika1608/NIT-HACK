'use client';
import { ChakraProvider, useToast } from '@chakra-ui/react';
import React, { use, useEffect, useState } from 'react';
import {
  Box,
  Button,
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
import { useRouter } from 'next/navigation';

// Define the form data interface
interface FormData {
  email: string;
  password: string;
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
    password?: {
      message: string;
      type: string;
      field: string;
    };
  };
}






function SignInContent() {
  const textColor = useColorModeValue('white', 'white');
  const textColorSecondary = 'gray.400';
  const textColorDetails = useColorModeValue('navy.700', 'secondaryGray.600');
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const googleBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.200');
  const googleText = useColorModeValue('navy.700', 'white');
  const router = useRouter();
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
    email: '',
    password: '',
  });
  const toast = useToast();

  useEffect(() => {
    // Redirect to profile if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/admin/profile');
    }
  }, [router]);

  const handleClick = () => setShow(!show);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://harassment-saver-extension.onrender.com/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.errors?.email?.message ||
          data.errors?.password?.message ||
          'Login failed'
        );
      }

      // Save token to local storage
      if (data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
      }

      router.push('/admin/profile');

      // Success
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect or perform other actions
      console.log('User logged in:', data.data?.user);

      // Example: Redirect to dashboard
      // router.push('/dashboard'); // If using Next.js router

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
            Sign In
          </Heading>
          <Text
            mb="36px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
            textAlign="center"
          >
            Enter your email and password to sign in!
          </Text>
        </Box>
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
              Sign in with Google
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
              <Flex justifyContent="space-between" align="center" mb="24px">
                <FormControl display="flex" alignItems="center">
                  {/* <Checkbox
                    id="remember-login"
                    colorScheme="brandScheme"
                    me="10px"
                  /> */}
                  {/* <FormLabel
                    htmlFor="remember-login"
                    mb="0"
                    fontWeight="normal"
                    color={textColor}
                    fontSize="sm"
                  >
                    Keep me logged in
                  </FormLabel> */}
                </FormControl>
                <Link href="/auth/forgot-password">
                  {/* <Text
                    color={textColorBrand}
                    fontSize="sm"
                    w="124px"
                    fontWeight="500"
                  >
                    Forgot password?
                  </Text> */}
                </Link>
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
                Sign In
              </Button>
            </FormControl>
            <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              maxW="100%"
              mt="0px"
            >
              <Link href="/auth/sign-up">
                <Text color={textColorDetails} fontWeight="400" fontSize="14px">
                  Not registered yet?
                  <Text
                    color={textColorBrand}
                    as="span"
                    ms="5px"
                    fontWeight="500"
                  >
                    Create an Account
                  </Text>
                </Text>
              </Link>
            </Flex>
          </Flex>
        </form>
      </Flex>
    </Flex>
  );
}

export default function SignIn() {
  return (
    <ChakraProvider>
      <SignInContent />
    </ChakraProvider>
  );
}