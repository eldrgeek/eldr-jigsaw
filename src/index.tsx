import * as React from 'react';
import { render } from 'react-dom';
import { ChakraProvider } from '@chakra-ui/react';

import App from './App';
const Root = () => {
	return (
		<ChakraProvider>
			<App />
		</ChakraProvider>
	);
};

const rootElement = document.getElementById('root');
render(<Root />, rootElement);
