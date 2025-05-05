import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useHealthStore } from '@/store/healthStore';
import { useToast } from '@/hooks/use-toast';
import { getFoodNutritionInfoFromGemini } from '@/services/NutritionGeminiService';
import { cn } from '@/lib/utils';

interface ExpandableSearchProps {
  onSearchResult: (foodName: string) => void;
}

const ExpandableSearch: React.FC<ExpandableSearchProps> = ({ onSearchResult }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { geminiTier, geminiApiKey } = useHealthStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const isPro = geminiTier === 'pro';
  const controls = useAnimation();

  useEffect(() => {
    // Focus the input when expanded
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    // Close search on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (!isExpanded && isPro) {
      // Only apply the pulse animation if the button is not expanded and the user is Pro
      const sequence = async () => {
        await controls.start({
          scale: 1.05,
          transition: { duration: 0.3, ease: "easeInOut" }
        });
        await controls.start({
          scale: 1,
          transition: { duration: 0.3, ease: "easeInOut" }
        });
      };

      // First set the initial state
      controls.set({ scale: 1, opacity: 1 });

      // Start the sequence immediately
      sequence();

      // Then run it periodically
      const pulseInterval = setInterval(sequence, 5000);

      // Clean up interval
      return () => clearInterval(pulseInterval);
    }
  }, [isExpanded, isPro, controls]);

  const toggleSearch = () => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Food search is available only for Pro tier subscribers.",
        variant: "destructive",
      });
      return;
    }

    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setSearchQuery('');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // Pass the search query to the parent component
      onSearchResult(searchQuery);

      // Collapse the search bar after successful search
      setIsExpanded(false);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Could not process your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative z-10">
      <AnimatePresence>
        {isExpanded ? (
          <motion.form
            initial={{ width: '40px', opacity: 0.5 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ width: '40px', opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4
            }}
            className="flex items-center"
            onSubmit={handleSearch}
          >
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search for a food item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 w-full transition-shadow duration-300 focus:shadow-md"
                disabled={isSearching}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute right-0 top-0 h-full"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-full"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="ml-1"
                disabled={!searchQuery.trim() || isSearching}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                className="ml-1"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </motion.div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={controls}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17,
              duration: 0.3
            }}
          >
            <Button
              onClick={toggleSearch}
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full p-2 transition-all duration-300 hover:shadow-md",
                !isPro && "text-muted-foreground hover:text-foreground",
                isPro && "hover:bg-primary/10"
              )}
            >
              <div className="relative">
                <Search className="h-5 w-5 transition-transform duration-300" />
                {!isPro && (
                  <span className="absolute -top-2 -right-2 bg-background rounded-full">
                    <Lock className="h-3 w-3" />
                  </span>
                )}
              </div>
              <span className="sr-only">Search foods</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpandableSearch;
