import { useEffect, useMemo, useState } from 'react';

import { searchUniversities } from '../../../api/public';
import { UniversitySearchResult } from '../../../api/types';

type UseUniversityEmailDomainOptions = {
  enabled: boolean;
  email: string;
  onEmailChange: (nextEmail: string) => void;
};

function getEmailDomain(value: string): string {
  const trimmed = value.trim();
  const atIndex = trimmed.lastIndexOf('@');
  return atIndex >= 0 ? trimmed.slice(atIndex + 1).toLowerCase() : '';
}

function applyEmailDomain(value: string, domain: string): string {
  const trimmed = value.trim();
  const normalizedDomain = domain.trim();

  if (!normalizedDomain) {
    return trimmed;
  }

  const localPart = trimmed.includes('@') ? trimmed.split('@', 1)[0].trim() : trimmed;
  if (!localPart) {
    return trimmed;
  }

  return `${localPart}@${normalizedDomain}`;
}

export function useUniversityEmailDomain({
  enabled,
  email,
  onEmailChange,
}: UseUniversityEmailDomainOptions) {
  const [universityQuery, setUniversityQuery] = useState('');
  const [universityCountry, setUniversityCountry] = useState('Portugal');
  const [universityResults, setUniversityResults] = useState<UniversitySearchResult[]>([]);
  const [selectedUniversityIndex, setSelectedUniversityIndex] = useState<number>(0);
  const [selectedUniversityDomain, setSelectedUniversityDomain] = useState('');
  const [isSearchingUniversities, setIsSearchingUniversities] = useState(false);
  const [universityError, setUniversityError] = useState('');

  const selectedUniversity = useMemo(
    () => universityResults[selectedUniversityIndex] || null,
    [selectedUniversityIndex, universityResults]
  );

  async function loadUniversities(query: string, country: string) {
    setIsSearchingUniversities(true);
    setUniversityError('');

    try {
      const items = await searchUniversities({
        name: query,
        country,
        limit: 25,
      });

      setUniversityResults(items);
      setSelectedUniversityIndex(0);
      setSelectedUniversityDomain(items[0]?.domains[0] || '');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel carregar as universidades.';
      setUniversityError(message);
      setUniversityResults([]);
      setSelectedUniversityIndex(0);
      setSelectedUniversityDomain('');
    } finally {
      setIsSearchingUniversities(false);
    }
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void loadUniversities('', universityCountry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, universityCountry]);

  useEffect(() => {
    if (!selectedUniversity) {
      setSelectedUniversityDomain('');
      return;
    }

    const currentEmailDomain = getEmailDomain(email);
    const nextDomain =
      (currentEmailDomain && selectedUniversity.domains.includes(currentEmailDomain)
        ? currentEmailDomain
        : '') || selectedUniversity.domains[0] || '';

    setSelectedUniversityDomain(nextDomain);
  }, [email, selectedUniversity?.name]);

  function handleSelectUniversity(index: number) {
    const university = universityResults[index];
    if (!university) return;

    setSelectedUniversityIndex(index);
    const nextDomain = university.domains[0] || '';
    setSelectedUniversityDomain(nextDomain);

    if (nextDomain) {
      onEmailChange(applyEmailDomain(email, nextDomain));
    }
  }

  function handleEmailChange(nextEmail: string) {
    onEmailChange(
      selectedUniversityDomain ? applyEmailDomain(nextEmail, selectedUniversityDomain) : nextEmail
    );
  }

  function handleUniversityDomainChange(nextDomain: string) {
    setSelectedUniversityDomain(nextDomain);
    if (nextDomain) {
      onEmailChange(applyEmailDomain(email, nextDomain));
    }
  }

  return {
    universityQuery,
    setUniversityQuery,
    universityCountry,
    setUniversityCountry,
    universityResults,
    selectedUniversityIndex,
    selectedUniversityDomain,
    selectedUniversity,
    isSearchingUniversities,
    universityError,
    loadUniversities,
    handleSelectUniversity,
    handleEmailChange,
    handleUniversityDomainChange,
  };
}
