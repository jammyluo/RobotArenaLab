import { Heart, MessageCircle, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CommunityPost, User, Model } from "@shared/schema";

interface CommunityPostProps {
  post: CommunityPost & { user: User; model?: Model };
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onDownloadModel?: (modelId: number) => void;
}

export function CommunityPost({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onDownloadModel 
}: CommunityPostProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {getInitials(post.user.fullName)}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-slate-50">{post.user.fullName}</h4>
            {post.user.affiliation && (
              <span className="text-slate-400 text-sm">{post.user.affiliation}</span>
            )}
            <span className="text-slate-500 text-sm">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
          
          <p className="text-slate-300 mb-4">{post.content}</p>
          
          {post.model && (
            <Card className="bg-slate-700 border-slate-600 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-slate-50">{post.model.name}</h5>
                  <p className="text-sm text-slate-400">{post.model.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {post.model.modelType}
                    </Badge>
                    {post.model.accuracy && (
                      <span className="text-xs text-emerald-400">
                        {post.model.accuracy.toFixed(1)}% accuracy
                      </span>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => post.model && onDownloadModel?.(post.model.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Download
                </Button>
              </div>
            </Card>
          )}

          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onLike?.(post.id)}
              className="flex items-center space-x-1 text-slate-400 hover:text-slate-50 p-0"
            >
              <Heart className="w-4 h-4" />
              <span>{post.likes}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onComment?.(post.id)}
              className="flex items-center space-x-1 text-slate-400 hover:text-slate-50 p-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onShare?.(post.id)}
              className="flex items-center space-x-1 text-slate-400 hover:text-slate-50 p-0"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
