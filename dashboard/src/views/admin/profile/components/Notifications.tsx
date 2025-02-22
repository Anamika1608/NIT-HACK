import { Flex, Text, useColorModeValue } from '@chakra-ui/react';
import Card from 'components/card/Card';
import SwitchField from 'components/fields/SwitchField';
import Menu from 'components/menu/MainMenu';

export default function SafetyNotifications(props: { [x: string]: any }) {
    const { ...rest } = props;
    const textColorPrimary = useColorModeValue('secondaryGray.900', 'white');
    
    return (
        <Card mb='20px' {...rest}>
            <Flex align='center' w='100%' justify='space-between' mb='30px'>
                <Text color={textColorPrimary} fontWeight='bold' fontSize='2xl' mb='4px'>
                    Safety Alerts
                </Text>
                <Menu />
            </Flex>
            <SwitchField
                isChecked={true}
                reversed={true}
                fontSize='sm'
                mb='20px'
                id='1'
                label='Notify when new messages from marked accounts are hidden'
            />
            <SwitchField 
                reversed={true} 
                fontSize='sm' 
                mb='20px' 
                id='2' 
                label='Alert when screenshots are automatically saved' 
            />
            <SwitchField 
                reversed={true} 
                fontSize='sm' 
                mb='20px' 
                id='3' 
                label='Notify about new evidence collected' 
            />
            <SwitchField 
                reversed={true} 
                fontSize='sm' 
                mb='20px' 
                id='4' 
                label='Daily summary of hidden messages' 
            />
            <SwitchField 
                reversed={true} 
                fontSize='sm' 
                mb='20px' 
                id='5' 
                label='Alert when marked account creates new profile' 
            />
            <SwitchField 
                reversed={true} 
                fontSize='sm' 
                mb='20px' 
                id='6' 
                label='Notify when report is ready for review' 
            />
            <SwitchField 
                reversed={true} 
                fontSize='sm' 
                mb='20px' 
                id='7' 
                label='Updates about submitted reports' 
            />
            <SwitchField 
                reversed={true} 
                fontSize='sm' 
                mb='20px' 
                id='8' 
                label='Weekly safety summary' 
            />
            <SwitchField 
                reversed={true} 
                fontSize='sm' 
                mb='20px' 
                id='9' 
                label='Receive safety tips and best practices' 
            />
            <SwitchField 
                reversed={true} 
                fontSize='sm' 
                mb='20px' 
                id='10' 
                label='Emergency contact notifications' 
            />
        </Card>
    );
}