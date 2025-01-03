"use client"
import { useLayoutEffect, useState } from 'react';
import { Box, Flex, IconButton, VStack, Button, Text, useBreakpointValue, Skeleton } from '@chakra-ui/react';
import { FaBars, FaDiscord, FaUserAlt } from 'react-icons/fa';
import LoginModal from '../features/auth/components/auth-modal';

 const UnauthenticatedSidebarSkeleton = ({ isMobile }: any) => (
 isMobile ? (
   <Box>
     <Flex
       bg="rgba(0,0,0,0.9)"
       px={4}
       py={3}
       position="fixed"
       top={0}
       left={0}
       right={0}
       zIndex={1000}
     >
       <Skeleton w="32px" h="32px" />
       <Skeleton w="100px" h="24px" mx="auto" />
       <Skeleton w="80px" h="32px" />
     </Flex>

     <Box
       position="fixed"
       bottom={0}
       left={0}
       right={0}
       p={3}
       bg="rgba(0,0,0,0.9)"
     >
       <Skeleton h="48px" />
     </Box>
   </Box>
 ) : (
   <Flex
     position="fixed"
     left={0}
     top={0}
     bottom={0}
     w="60px"
     bg="rgba(0,0,0,0.9)"
     direction="column"
     p={4}
   >
     <Skeleton w="32px" h="32px" mb={4} />
     <VStack spacing={4}>
       <Skeleton w="32px" h="32px" />
       <Skeleton w="32px" h="32px" />
     </VStack>
   </Flex>
 )
);

export default function UnauthenticatedSidebar() {
 const [isExpanded, setIsExpanded] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
 const isMobile = useBreakpointValue({ base: true, md: false }, { ssr: false, fallback: 'md' });

 useLayoutEffect(() => {
   setIsLoading(false);
 }, []);

 if (isLoading) return <UnauthenticatedSidebarSkeleton isMobile={isMobile} />;

 const LoginButton = ({ variant = "default" }) => (
   <Button
     leftIcon={<FaUserAlt />}
     onClick={() => setIsModalOpen(true)}
     w={isMobile ? (variant === "footer" ? "full" : "50%") : "full"}
     maxW={variant === "footer" ? "300px" : "none"}
     mx="auto"
     size="md"
     bgGradient="linear(to-r, red.500, red.700)"
     color="white"
     _hover={{
       bgGradient: 'linear(to-r, red.600, red.800)',
       transform: 'translateY(-2px)'
     }}
   >
     {variant === "footer" ? "Login" : (isMobile || isExpanded ? "Login" : "")}
   </Button>
 );

 const NavContent = () => (
   <VStack spacing={4} w="full" p={4}>
     <LoginButton />
     <Button
       as="a"
       href="https://discord.gg/2uYKmHNmHP"
       leftIcon={<FaDiscord />}
       variant="ghost"
       color="gray.300"
       w="full"
       _hover={{ bg: 'whiteAlpha.100' }}
     >
       {isMobile || isExpanded ? "Discord Support" : ""}
     </Button>
   </VStack>
 );

 return (
   <>
     {isMobile ? (
       <>
         <Flex
           bg="rgba(0,0,0,0.9)"
           backdropFilter="blur(10px)"
           px={4}
           py={3}
           justify="space-between"
           position="fixed"
           top={0}
           left={0}
           right={0}
           zIndex={1000}
         >
           <IconButton
             icon={<FaBars />}
             variant="ghost"
             color="white"
             onClick={() => setIsExpanded(!isExpanded)}
             size="sm"
             aria-label="Toggle menu"
           />
           <Text color="white" fontSize="lg" fontWeight="bold">Firebot</Text>
           <LoginButton />
         </Flex>

         <Box
           position="fixed"
           top="56px"
           left={0}
           right={0}
           height={isExpanded ? 'calc(100% - 56px)' : 0}
           bg="rgba(0,0,0,0.95)"
           overflow="hidden"
           transition="height 0.2s"
           zIndex={999}
         >
           {isExpanded && <NavContent />}
         </Box>

         <Box
           position="fixed"
           bottom={0}
           left={0}
           right={0}
           p={3}
           bg="rgba(0,0,0,0.9)"
           borderTop="1px solid rgba(255,255,255,0.1)"
           zIndex={1000}
         >
         </Box>
       </>
     ) : (
       <Box
         position="fixed"
         left={0}
         top={0}
         bottom={0}
         width={isExpanded ? '240px' : '60px'}
         bg="rgba(0,0,0,0.9)"
         transition="width 0.3s"
         zIndex={1000}
         borderRight="1px solid rgba(255,255,255,0.1)"
       >
         <Flex direction="column" h="100%" py={4}>
           <IconButton
             icon={<FaBars />}
             variant="ghost"
             color="white"
             onClick={() => setIsExpanded(!isExpanded)}
             alignSelf="center"
             mb={4}
             aria-label="Toggle menu"
           />
           <NavContent />
         </Flex>
       </Box>
     )}

     <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
   </>
 );
}
