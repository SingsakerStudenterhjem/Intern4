import { useEffect, useMemo, useState } from 'react';
import { createSignedImageUrls } from '../../../server/storage';

type WithPicture = { id: string; profilePicture?: string | null };

// Signs all visible profile pictures in one request; returns id -> URL.
export const useProfilePictureUrls = (people: WithPicture[]): Record<string, string> => {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const withPictures = useMemo(
    () => people.filter((person): person is Required<WithPicture> => !!person.profilePicture),
    [people]
  );
  const key = withPictures.map((person) => `${person.id}:${person.profilePicture}`).join('|');

  useEffect(() => {
    if (withPictures.length === 0) return;
    let current = true;
    createSignedImageUrls(withPictures.map((person) => person.profilePicture as string))
      .then((signed) => {
        if (!current) return;
        setUrls(
          Object.fromEntries(withPictures.map((person, index) => [person.id, signed[index]]))
        );
      })
      .catch((error) => console.error('Kunne ikke laste profilbilder', error));
    return () => {
      current = false;
    };
    // `key` captures the people and paths; the array itself changes identity on every load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return urls;
};
