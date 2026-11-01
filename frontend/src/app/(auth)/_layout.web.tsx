import { Redirect } from 'expo-router';

export default function AuthWebLayout() {
  return (
    <Redirect href="/privacy-policy" />
  );
}