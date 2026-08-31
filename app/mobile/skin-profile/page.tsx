import SkinProfileContent from "@/components/SkinProfileContent";
import { getUser } from "@/lib/auth/getUser";

export default async function MobileSkinProfilePage() {
  const user = await getUser();

  return (
    <main className="px-5 py-8">
      <SkinProfileContent user={user} />
    </main>
  );
}
