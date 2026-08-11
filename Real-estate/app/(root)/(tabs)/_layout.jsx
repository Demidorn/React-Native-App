import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" md="home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon sf="magnifyingglass" md="search" />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      {/* create property*/}

      <NativeTabs.Trigger name="saved">
        <Icon sf="heart.fill" md="favorite" />
        <Label>Saved</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon sf="person.circle" md="account_circle" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
