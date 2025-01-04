import { Button } from "@chakra-ui/react";
import { FaUserAlt } from "react-icons/fa";
import { LoginButtonProps } from "./types";

 const LoginButton: React.FC<LoginButtonProps> = ({ 
  variant = 'default',
  isMobile,
  isExpanded,
  onOpenModal
 }) => (
  <Button
    leftIcon={<FaUserAlt />}
    onClick={onOpenModal}
    w={isMobile ? (variant === 'footer' ? 'full' : '50%') : 'full'}
    maxW={variant === 'footer' ? '300px' : 'none'}
    mx="auto" 
    size="md"
    bgGradient="linear(to-r, red.500, red.700)"
    color="white"
    _hover={{
      bgGradient: 'linear(to-r, red.600, red.800)',
      transform: 'translateY(-2px)',
    }}
  >
    {variant === 'footer' ? 'Login' : isMobile || isExpanded ? 'Login' : ''}
  </Button>
 )

 export default LoginButton;