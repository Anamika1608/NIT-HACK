import React from 'react';
import { Box, Button, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import Card from 'components/card/Card';
import { MdUpload } from 'react-icons/md';
import Dropzone from 'views/admin/profile/components/Dropzone';

export default function Upload(props: { [x: string]: any; used: any; total: any; }) {
    const { used, total, ...rest } = props;
    const textColorPrimary = useColorModeValue('secondaryGray.900', 'white');
    const brandColor = useColorModeValue('brand.500', 'white');
    const textColorSecondary = 'gray.400';
    
    return (
        <Card {...rest} mb='20px' alignItems='center' p='20px'>
            <Flex h='100%' direction={{ base: 'column', '2xl': 'row' }}>
                <Dropzone
                    w={{ base: '100%', '2xl': '268px' }}
                    me='36px'
                    maxH={{ base: '60%', lg: '50%', '2xl': '100%' }}
                    minH={{ base: '60%', lg: '50%', '2xl': '100%' }}
                    content={
                        <Box>
                            <Icon as={MdUpload} w='80px' h='80px' color={brandColor} />
                            <Flex justify='center' mx='auto' mb='12px'>
                                <Text fontSize='xl' fontWeight='700' color={brandColor}>
                                    Upload Evidence
                                </Text>
                            </Flex>
                            <Text fontSize='sm' fontWeight='500' color='secondaryGray.500'>
                                Screenshots, message exports, and media files accepted
                            </Text>
                        </Box>
                    }
                />
                <Flex direction='column' pe='44px'>
                    <Text
                        color={textColorPrimary}
                        fontWeight='bold'
                        textAlign='start'
                        fontSize='2xl'
                        mt={{ base: '20px', '2xl': '50px' }}>
                        Document Unwanted Behavior
                    </Text>
                    <Text
                        color={textColorSecondary}
                        fontSize='md'
                        my={{ base: 'auto', '2xl': '10px' }}
                        mx='auto'
                        textAlign='start'>
                        Safely store evidence of harassment from social media platforms. Your uploads are 
                        automatically organized and secured for future reporting needs.
                    </Text>
                    <Flex w='100%'>
                        <Button
                            me='100%'
                            mb='50px'
                            w='140px'
                            minW='140px'
                            mt={{ base: '20px', '2xl': 'auto' }}
                            variant='brand'
                            fontWeight='500'>
                            Save Evidence
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Card>
    );
}