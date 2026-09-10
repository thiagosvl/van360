import { useState, useRef, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { useAdminUsers } from "@/hooks/api/adminHooks";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { phoneMask } from "@/utils/masks";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { AdminUserListItem } from "@/services/api/admin/admin-user.api";

interface AdminUserQuickSwitcherProps {
  currentUserId?: string;
  className?: string;
}

export function AdminUserQuickSwitcher({ currentUserId, className }: AdminUserQuickSwitcherProps) {
  const navigate = useNavigate();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);
  const isSearchActive = debouncedSearch.length >= 1;

  const { data, isFetching } = useAdminUsers(
    { search: debouncedSearch, limit: 15 },
    { enabled: isSearchActive }
  );

  const users: AdminUserListItem[] = isSearchActive ? data?.data ?? [] : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelectUser(userId: string) {
    if (userId === currentUserId) {
      setIsOpen(false);
      return;
    }
    navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${userId}`);
    setSearch("");
    setIsOpen(false);
  }

  function handleClear() {
    setSearch("");
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative w-full sm:max-w-md", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-slate-500 pointer-events-none" />
        <Input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (search.trim().length >= 1) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder="Trocar de motorista... (nome, telefone ou ID)"
          className="pl-9 pr-9 h-10 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus-visible:ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          )}
          {!isFetching && search.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && isSearchActive && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-[#131b2e] border border-slate-800/90 shadow-2xl overflow-hidden backdrop-blur-xl"
        >
          {isFetching && users.length === 0 ? (
            <div className="flex items-center justify-center gap-2.5 py-6 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              <span>Buscando motoristas...</span>
            </div>
          ) : !isFetching && users.length === 0 ? (
            <div className="py-6 px-4 text-center text-xs text-slate-400">
              Nenhum motorista encontrado para "{search}".
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Motoristas encontrados</span>
                <span>{users.length} {users.length === 1 ? "resultado" : "resultados"}</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/40">
                {users.map((user) => {
                  const isCurrent = user.id === currentUserId;
                  const subscription = Array.isArray(user.assinaturas) ? user.assinaturas[0] : null;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      role="option"
                      aria-selected={isCurrent}
                      onClick={() => handleSelectUser(user.id)}
                      className={cn(
                        "w-full text-left p-3 flex items-center justify-between gap-3 transition-colors",
                        isCurrent
                          ? "bg-blue-500/10 cursor-default"
                          : "hover:bg-slate-800/60 cursor-pointer"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black text-xs flex items-center justify-center shrink-0">
                          {user.nome.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-slate-200 truncate">
                              {user.nome}
                            </span>
                            {user.apelido && (
                              <span className="text-[11px] text-slate-400 truncate">
                                ({user.apelido})
                              </span>
                            )}
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">
                                <Check className="h-2.5 w-2.5" />
                                Atual
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                            {user.telefone && (
                              <span>{phoneMask(user.telefone)}</span>
                            )}
                            {user.telefone && user.email && <span>•</span>}
                            {user.email && (
                              <span className="truncate">{user.email}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {subscription ? (
                        <div className="shrink-0">
                          <SubscriptionStatusBadge
                            status={subscription.status}
                            dataVencimento={subscription.data_vencimento}
                          />
                        </div>
                      ) : (
                        user.tipo && user.tipo !== "motorista" && (
                          <div className="shrink-0">
                            <span className="text-[10px] uppercase font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                              {user.tipo === "motorista_auxiliar" ? "Auxiliar" : user.tipo}
                            </span>
                          </div>
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
