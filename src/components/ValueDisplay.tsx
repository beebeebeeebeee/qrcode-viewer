import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ChevronDown, Copy } from 'lucide-react';
import { parseTotpUri, generateTotpCode, getTimeRemaining } from '../utils/totp';
import { useToast } from '../hooks/use-toast';

interface ValueDisplayProps {
  value: string;
}

export function ValueDisplay({ value }: ValueDisplayProps) {
  const [open, setOpen] = useState(false);
  const [totpCode, setTotpCode] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const { toast } = useToast();
  
  const isUrl = value.startsWith('http://') || value.startsWith('https://');
  const isTotpUri = value.startsWith('otpauth://totp/');
  
  let urlWithoutQuery = '';
  let domain = '';
  
  if (isUrl) {
    try {
      const url = new URL(value);
      domain = url.hostname;
      urlWithoutQuery = `${url.protocol}//${url.hostname}${url.pathname}`;
    } catch {
      // Invalid URL, continue without setting these values
    }
  }
  
  useEffect(() => {
    if (!isTotpUri) return;
    
    const totpData = parseTotpUri(value);
    if (!totpData) return;
    
    // Generate initial code
    const code = generateTotpCode(totpData.secret);
    if (code) setTotpCode(code);
    else setTotpCode('Error');
    
    // Set up timer to update time remaining and refresh code
    const remainingTime = getTimeRemaining();
    setTimeRemaining(remainingTime);
    
    const intervalId = setInterval(() => {
      const newTimeRemaining = getTimeRemaining();
      setTimeRemaining(newTimeRemaining);
      
      // If time is up, generate a new code
      if (newTimeRemaining === 30) {
        const newCode = generateTotpCode(totpData.secret);
        if (newCode) setTotpCode(newCode);
        else setTotpCode('Error');
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [value, isTotpUri]);
  
  const handleCopyTotpCode = () => {
    if (!totpCode || totpCode === 'Error') return;
    
    navigator.clipboard.writeText(totpCode)
      .then(() => {
        toast({
          title: "Copied!",
          description: "TOTP code copied to clipboard",
          variant: "success",
        });
      })
      .catch(error => {
        console.error('Failed to copy code:', error);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      });
  };
  
  const handleOpenInBrowser = (urlToOpen: string) => {
    window.open(urlToOpen, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className="flex flex-col items-left w-full gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div 
            className="text-sm truncate cursor-pointer text-gray-600 hover:text-gray-800 mr-2 flex-1 min-w-0 max-w-full overflow-hidden"
            title="Click to see full value"
          >
            {value}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Value Content</DialogTitle>
          </DialogHeader>
          <div className="p-2 border rounded-md bg-gray-50">
            <textarea 
              readOnly
              className="w-full h-32 p-2 bg-transparent resize-none focus:outline-none text-sm"
              value={value}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {isTotpUri && totpCode && (
        <div className="flex justify-end items-center space-x-2">
          <div className="text-lg font-mono font-bold">{totpCode}</div>
          <div className="text-xs text-gray-500">({timeRemaining}s)</div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleCopyTotpCode}
            className="text-gray-600 hover:text-gray-800"
            title="Copy to clipboard"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {isUrl && (
        <div className="flex justify-end flex-shrink-0 overflow-hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                Browse
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenInBrowser(value)}>
                Visit url
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenInBrowser(`https://${domain}`)}>
                Visit domain
              </DropdownMenuItem>
              {urlWithoutQuery !== value && (
                <DropdownMenuItem onClick={() => handleOpenInBrowser(urlWithoutQuery)}>
                  Visit without query
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
} 