// Chakra imports
import { SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
import Information from 'views/admin/profile/components/Information';

// Assets
export default function GeneralInformation(props: { [x: string]: any }) {
	const { ...rest } = props;
	// Chakra Color Mode
	const textColorPrimary = useColorModeValue('secondaryGray.900', 'white');
	const textColorSecondary = 'gray.400';
	const cardShadow = useColorModeValue('0px 18px 40px rgba(112, 144, 176, 0.12)', 'unset');
	return (
		<Card mb={{ base: '0px', '2xl': '20px' }} {...rest}>
			<Text color={textColorPrimary} fontWeight='bold' fontSize='2xl' mt='10px' mb='4px'>
				User Protection Information
			</Text>
			<Text color={textColorSecondary} fontSize='md' me='26px' mb='40px'>
				Your safety is our priority. Here, you can review your reporting history, active protection measures, and
				account security settings. Stay informed and take control of your online safety.
			</Text>
			<SimpleGrid columns={2} gap='20px'>
				<Information boxShadow={cardShadow} title='Report History' value='5 Reports Filed' />
				<Information boxShadow={cardShadow} title='Account Status' value='Protected' />
				<Information boxShadow={cardShadow} title='Two-Factor Authentication' value='Enabled' />
				<Information boxShadow={cardShadow} title='Privacy Level' value='High' />
				<Information boxShadow={cardShadow} title='Last Report Status' value='Under Review' />
				<Information boxShadow={cardShadow} title='Community Guidelines' value='Compliant' />
			</SimpleGrid>
		</Card>
	);
}
