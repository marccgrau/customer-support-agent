type Config = {
  includeLeftSidebar: boolean;
  includeRightSidebar: boolean;
  includeMockMessages: boolean;
};

const config: Config = {
  includeLeftSidebar: process.env.NEXT_PUBLIC_INCLUDE_LEFT_SIDEBAR === 'false',
  includeRightSidebar: process.env.NEXT_PUBLIC_INCLUDE_RIGHT_SIDEBAR === 'true',
  includeMockMessages: process.env.NEXT_PUBLIC_INCLUDE_MOCK_MESSAGES === 'true',
};

export default config;
