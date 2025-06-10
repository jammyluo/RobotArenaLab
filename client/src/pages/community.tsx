import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Share, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CommunityPost } from "@/components/community/community-post";
import type { CommunityPost as CommunityPostType, User, Model } from "@shared/schema";

export default function CommunityPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch community posts
  const { data: posts = [], isLoading } = useQuery<(CommunityPostType & { user: User; model?: Model })[]>({
    queryKey: ['/api/community/posts'],
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');
      
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likes: post.likes + 1 }),
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to like post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
    },
  });

  const handleLike = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleComment = (postId: number) => {
    toast({
      title: "Comments",
      description: "Comment feature coming soon!",
    });
  };

  const handleShare = (postId: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/community/posts/${postId}`);
    toast({
      title: "Link Copied",
      description: "Post link copied to clipboard",
    });
  };

  const handleDownloadModel = (modelId: number) => {
    toast({
      title: "Download Started",
      description: "Model download initiated",
    });
  };

  if (isLoading) {
    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className="h-64 bg-slate-800 border border-slate-700 rounded-xl animate-pulse"
              />
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-slate-800 border border-slate-700 rounded-xl animate-pulse" />
            <div className="h-32 bg-slate-800 border border-slate-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </>
    );
  }

  const trendingModels = [
    { name: "Humanoid Soccer Player", downloads: 245, rank: 1 },
    { name: "Drone Swarm Controller", downloads: 198, rank: 2 },
    { name: "Surgical Robot Arm", downloads: 176, rank: 3 },
  ];

  const activeResearchers = [
    { name: "Dr. Sarah Rodriguez", affiliation: "MIT CSAIL", initials: "DR" },
    { name: "Prof. Michael Kim", affiliation: "Stanford AI Lab", initials: "MK" },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-50">Community</h2>
            <p className="text-slate-400 mt-1">Share models and collaborate with other researchers</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
            <Share className="w-4 h-4 mr-2" />
            Share Model
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Community Feed */}
          <div className="lg:col-span-2 space-y-6">
            {posts.length === 0 ? (
              <Card className="p-12 text-center bg-slate-800 border-slate-700">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-50 mb-2">No posts yet</h3>
                <p className="text-slate-400 mb-4">
                  Be the first to share your models and insights with the community
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <Share className="w-4 h-4 mr-2" />
                  Share Your First Model
                </Button>
              </Card>
            ) : (
              posts.map((post) => (
                <CommunityPost
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                  onDownloadModel={handleDownloadModel}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Models */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trending Models
              </h3>
              <div className="space-y-4">
                {trendingModels.map((model) => (
                  <div key={model.rank} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      model.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                      model.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      'bg-gradient-to-br from-amber-600 to-yellow-600'
                    }`}>
                      <span className="text-white text-xs font-bold">{model.rank}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-50">{model.name}</p>
                      <p className="text-xs text-slate-400">{model.downloads} downloads</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Active Researchers */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Active Researchers
              </h3>
              <div className="space-y-3">
                {activeResearchers.map((researcher) => (
                  <div key={researcher.name} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{researcher.initials}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-50">{researcher.name}</p>
                      <p className="text-xs text-slate-400">{researcher.affiliation}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 text-xs">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
