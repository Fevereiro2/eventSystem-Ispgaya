import { useEffect } from 'react';

import { fetchAdminPhotos, InfoCulturaPhoto } from '../../../api/infoculturaApi';

type UseAdminPhotosOptions = {
  token: string;
  setPhotos: (value: InfoCulturaPhoto[]) => void;
  setIsLoadingPhotos: (value: boolean) => void;
  setPhotoFormError: (value: string) => void;
  handleAuthError: (error: unknown) => boolean;
};

export function sortPhotos(photos: InfoCulturaPhoto[]): InfoCulturaPhoto[] {
  return [...photos].sort((left, right) => {
    if (left.section !== right.section) {
      return left.section.localeCompare(right.section);
    }
    if (left.display_order !== right.display_order) {
      return left.display_order - right.display_order;
    }
    return right.updated_at.localeCompare(left.updated_at);
  });
}

export function useAdminPhotos({
  token,
  setPhotos,
  setIsLoadingPhotos,
  setPhotoFormError,
  handleAuthError,
}: UseAdminPhotosOptions) {
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    setIsLoadingPhotos(true);

    void fetchAdminPhotos(token)
      .then((nextPhotos) => {
        if (!isMounted) return;
        setPhotos(sortPhotos(nextPhotos));
      })
      .catch((error) => {
        if (!isMounted) return;
        if (handleAuthError(error)) return;
        const message = error instanceof Error ? error.message : 'Não foi possível carregar as fotos.';
        setPhotoFormError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingPhotos(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, setPhotos, setIsLoadingPhotos, setPhotoFormError, handleAuthError]);
}
