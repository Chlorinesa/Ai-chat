import { useState, useEffect } from 'react';
import { apiSearchedChats } from '../api/chats';
import { useDebounce } from './useDebounce';

export const useSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        
        if (debouncedQuery.trim() === '') {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const response = await apiSearchedChats(debouncedQuery);
                setResults(response.chats || []);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    return { query, setQuery, results, loading };
};