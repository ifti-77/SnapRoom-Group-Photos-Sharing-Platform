import Image from "next/image";
import Link from 'next/link'
import StoredRoom from "./_components/StoredRoom";

export default function Home() {
  return (
    <div>
      <h2>Welcome to Snap Room</h2>
      <p>Snap Room is a platform that allows you to create and share your own virtual rooms. You can share your  group photos without creating any external hassle. Invite your friends to join and share memories together!</p>
      <Link href={'/room/createroom'}>Create Room</Link>
      <StoredRoom />
    </div>
  );
}
