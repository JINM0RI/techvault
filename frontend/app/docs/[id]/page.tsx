import { redirect } from "next/navigation";

type TopicDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  redirect(`/topic/${params.id}`);
}
