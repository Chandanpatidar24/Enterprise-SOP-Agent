import { useState } from 'react';
import translations from '../components/Settings/translations';

export const useSettings = () => {
    const [theme, setTheme] = useState('dark');
    const [accentColor, setAccentColor] = useState('blue');
    const [language, setLanguage] = useState('en');
    const [selectedModel, setSelectedModel] = useState('opsmind4');
    const [modelsList, setModelsList] = useState([
        { id: 1, name: 'OpsMind 4.0 (Gemini Pro)', access: ['admin', 'manager', 'user'], modelId: 'opsmind4' },
        { id: 2, name: 'OpsMind 4.2 (GPT-4)', access: ['admin', 'manager'], modelId: 'opsmind42' },
        { id: 3, name: 'OpsMind 5.0 (Claude 3 Opus)', access: ['admin'], modelId: 'opsmind5' }
    ]);

    const t = translations[language];

    const accentMap = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        green: 'bg-emerald-500',
        orange: 'bg-orange-500',
    };

    return {
        theme,
        setTheme,
        accentColor,
        setAccentColor,
        language,
        setLanguage,
        t,
        selectedModel,
        setSelectedModel,
        modelsList,
        setModelsList,
        accentMap
    };
};
