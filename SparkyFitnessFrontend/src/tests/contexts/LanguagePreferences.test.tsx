import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import {
  PreferencesProvider,
  usePreferences,
} from '@/contexts/PreferencesContext';

const mockSave = jest.fn().mockResolvedValue(null);
const mockCreateWater = jest.fn().mockResolvedValue(null);
const mockSetPrimaryWater = jest.fn();
const mockUser = { id: 'local-user' };

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser, loading: false }),
}));
jest.mock('@/hooks/Settings/usePreferences', () => ({
  preferencesOptions: {
    user: () => ({ queryKey: ['user'] }),
    nutrients: () => ({ queryKey: ['nutrients'] }),
  },
  useUpdatePreferencesMutation: () => ({ mutateAsync: mockSave }),
}));
jest.mock('@/hooks/Settings/useWaterContainers', () => ({
  useCreateWaterContainerMutation: () => ({ mutateAsync: mockCreateWater }),
  useSetPrimaryWaterContainerMutation: () => ({
    mutateAsync: mockSetPrimaryWater,
  }),
}));

function renderPreferences(language?: string) {
  const client = new QueryClient();
  const saved = language
    ? {
        language,
        date_format: 'MM/dd/yyyy',
        time_format: 'h:mm A',
        default_weight_unit: 'kg',
        default_measurement_unit: 'cm',
        default_distance_unit: 'km',
      }
    : null;
  jest
    .spyOn(client, 'fetchQuery')
    .mockImplementation(async (options) =>
      options.queryKey[0] === 'user' ? saved : []
    );
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <PreferencesProvider>{children}</PreferencesProvider>
    </QueryClientProvider>
  );
  return renderHook(() => usePreferences(), { wrapper });
}

beforeEach(() => jest.clearAllMocks());

it('stores Simplified Chinese when a web account first loads preferences', async () => {
  const { result } = renderPreferences();

  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: mockUser.id, language: 'zh-Hans' })
    )
  );
  expect(result.current.language).toBe('zh-Hans');
});

it('honors a language deliberately selected in account preferences', async () => {
  const { result } = renderPreferences('en');

  await waitFor(() => expect(result.current.language).toBe('en'));
  expect(mockSave).not.toHaveBeenCalled();
});
