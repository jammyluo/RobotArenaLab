import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Author {
  id: number;
  name: string;
  avatar: string;
  affiliation?: string;
}

interface ModelMarket {
  id: number;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  price?: number;
  likes: number;
  license: string;
  author: Author;
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelMarket | null>(null);
  const queryClient = useQueryClient();

  // 获取模型市场数据
  const { data: models = [], isLoading, isError } = useQuery<ModelMarket[]>({
    queryKey: ["/api/marketplace/models"],
    queryFn: async () => {
      const res = await fetch("/api/marketplace/models");
      if (!res.ok) throw new Error("获取模型市场数据失败");
      return res.json();
    },
  });

  // 点赞
  const likeMutation = useMutation({
    mutationFn: async (model: ModelMarket) => {
      const res = await fetch(`/api/marketplace/models/${model.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("点赞失败");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["/api/marketplace/models"]),
  });

  // 下载/购买
  const downloadMutation = useMutation({
    mutationFn: async (model: ModelMarket) => {
      const res = await fetch(`/api/marketplace/models/${model.id}/download`, { method: "POST" });
      if (!res.ok) throw new Error("下载/购买失败");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["/api/marketplace/models"]),
  });

  // 搜索和筛选
  const filteredModels = models.filter(m =>
    (!search || m.name.includes(search) || m.description.includes(search) || m.tags.some(t => t.includes(search))) &&
    (!category || m.category === category)
  );

  const handleDownload = (model: ModelMarket) => {
    downloadMutation.mutate(model);
  };
  const handleLike = (model: ModelMarket) => {
    likeMutation.mutate(model);
  };
  const handleShare = (model: ModelMarket) => {
    navigator.clipboard.writeText(`${window.location.origin}/marketplace/${model.id}`);
    alert("模型链接已复制");
  };

  return (
    <div className="space-y-6">
      {/* 搜索与筛选 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="搜索模型名称、描述、标签..."
          className="w-full md:w-1/3 px-4 py-2 rounded border border-slate-600 bg-slate-800 text-slate-50"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <select className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-50" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">全部类型</option>
            <option value="humanoid">人形机器人</option>
            <option value="drone">无人机</option>
            {/* ... */}
          </select>
          <select className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-50" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="latest">最新</option>
            <option value="popular">最热</option>
            <option value="rating">评分</option>
          </select>
        </div>
      </div>
      {/* 加载与错误处理 */}
      {isLoading && <div className="text-center text-slate-400">加载中...</div>}
      {isError && <div className="text-center text-red-400">加载失败，请稍后重试</div>}
      {/* 模型卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map(model => (
          <Card key={model.id} className="p-4 bg-slate-800 border-slate-700 flex flex-col cursor-pointer" onClick={() => { setSelectedModel(model); setShowDetail(true); }}>
            <img src={model.thumbnailUrl} alt={model.name} className="h-40 w-full object-cover rounded mb-3" />
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-50">{model.name}</h3>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">{model.category}</span>
            </div>
            <p className="text-slate-400 text-sm mb-2 line-clamp-2">{model.description}</p>
            <div className="flex items-center gap-2 mb-2">
              <img src={model.author.avatar} className="w-6 h-6 rounded-full" />
              <span className="text-xs text-slate-300">{model.author.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400">★ {model.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-xs">{model.downloads} 下载</span>
              {model.price ? (
                <span className="text-emerald-400 font-bold">￥{model.price}</span>
              ) : (
                <span className="text-slate-400 text-xs">免费</span>
              )}
            </div>
            <div className="flex gap-2 mt-auto">
              <Button onClick={e => { e.stopPropagation(); handleDownload(model); }} className="flex-1" disabled={downloadMutation.isPending}>
                {model.price ? "购买并下载" : "下载"}
              </Button>
              <Button variant="outline" onClick={e => { e.stopPropagation(); handleLike(model); }} className="flex-1" disabled={likeMutation.isPending}>
                👍 {model.likes}
              </Button>
              <Button variant="outline" onClick={e => { e.stopPropagation(); handleShare(model); }} className="flex-1">
                分享
              </Button>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {model.license}
            </div>
          </Card>
        ))}
      </div>
      {/* 模型详情弹窗 */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent>
          {selectedModel && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <img src={selectedModel.thumbnailUrl} className="w-full rounded" />
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold">{selectedModel.name}</h2>
                <div className="flex items-center gap-2">
                  <img src={selectedModel.author.avatar} className="w-8 h-8 rounded-full" />
                  <span>{selectedModel.author.name}</span>
                  <span className="text-xs text-slate-400">{selectedModel.author.affiliation}</span>
                </div>
                <p className="text-slate-400">{selectedModel.description}</p>
                <div className="flex gap-2">
                  {selectedModel.tags.map(tag => (
                    <span key={tag} className="bg-slate-700 text-xs px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-yellow-400">★ {selectedModel.rating.toFixed(1)}</span>
                  <span className="text-slate-400">{selectedModel.downloads} 下载</span>
                </div>
                <div className="text-xs text-slate-500">{selectedModel.license}</div>
                <div className="flex gap-2">
                  <Button onClick={() => handleDownload(selectedModel)} disabled={downloadMutation.isPending}>{selectedModel.price ? "购买并下载" : "下载"}</Button>
                  <Button variant="outline" onClick={() => handleLike(selectedModel)} disabled={likeMutation.isPending}>👍 {selectedModel.likes}</Button>
                  <Button variant="outline" onClick={() => handleShare(selectedModel)}>分享</Button>
                </div>
                {/* 评分与评论区可后续扩展 */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 