import { redirect } from "next/navigation";

type TechnologyPageProps = {
  params: {
    category: string;
    technology: string;
  };
};

export default async function TechnologyPage({ params }: TechnologyPageProps) {
  redirect(`/documentation/${params.category}`);
}
