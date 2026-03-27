import { useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Bell,
  Loader2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ArrowDown,
  ArrowUp,
  Percent,
  Mail,
  BellRing,
} from 'lucide-react';
import type { Alert, MarketItem } from '@/data/types';
import { cities, formatTierBadge, qualities } from '@/data/constants';
import { useAlertsForm } from '@/hooks/useAlertsForm';
import { useAlertsFeedback } from '@/hooks/useAlertsFeedback';
import { useAlertsUI } from '@/hooks/useAlertsUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AlertsManagerProps {
  availableItems: MarketItem[];
  alerts: Alert[];
  onSaveAlert: (alert: Alert) => Promise<void>;
  onDeleteAlert: (id: string) => Promise<void>;
}

function getEnchantLevel(itemId: string): number {
  const match = itemId.match(/@([0-3])$/);
  return match ? Number(match[1]) : 0;
}

function buildItemSearchText(item: MarketItem): string {
  const tierBadge = formatTierBadge(item.itemId, item.tier).toLowerCase();
  const enchantLevel = getEnchantLevel(item.itemId);

  return [
    item.itemName,
    item.tier,
    tierBadge,
    item.quality,
    enchantLevel > 0 ? `enchant ${enchantLevel}` : 'enchant 0',
    enchantLevel > 0 ? `ench ${enchantLevel}` : 'ench 0',
  ]
    .join(' ')
    .toLowerCase();
}

function matchesItemSearch(item: MarketItem, search: string): boolean {
  const normalizedSearch = search.toLowerCase().trim();
  if (!normalizedSearch) return true;

  const tokens = normalizedSearch.split(/\s+/).filter(Boolean);
  const haystack = buildItemSearchText(item);

  return tokens.every((token) => haystack.includes(token));
}

export function AlertsManager({ availableItems, alerts, onSaveAlert, onDeleteAlert }: AlertsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [pendingAlertIds, setPendingAlertIds] = useState<Set<string>>(new Set());

  const { form, alertType, createAlert, resetForm, suggestedThreshold } = useAlertsForm({
    availableItems,
  });

  const { notifyToggle, notifyDelete, notifyCreate } = useAlertsFeedback();

  const { getConditionIcon, getConditionText, getCityLabel } = useAlertsUI();
  const selectedItemValue = form.watch('itemId') && form.watch('quality')
    ? `${form.watch('itemId')}|${form.watch('quality')}`
    : '';

  const toggleAlert = async (alert: Alert) => {
    setPendingAlertIds((current) => new Set(current).add(alert.id));
    try {
      await onSaveAlert({ ...alert, isActive: !alert.isActive });
      notifyToggle(alert);
    } catch {
      toast.error('Unable to update alert', {
        description: `The alert for ${alert.itemName} could not be updated.`,
      });
    } finally {
      setPendingAlertIds((current) => {
        const next = new Set(current);
        next.delete(alert.id);
        return next;
      });
    }
  };

  const deleteAlert = async (id: string, itemName?: string) => {
    setPendingAlertIds((current) => new Set(current).add(id));
    try {
      await onDeleteAlert(id);
      notifyDelete(itemName);
    } catch {
      toast.error('Unable to delete alert', {
        description: itemName
          ? `The alert for ${itemName} could not be removed.`
          : 'The selected alert could not be removed.',
      });
    } finally {
      setPendingAlertIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  const onSubmit = async (values: Parameters<typeof createAlert>[0]) => {
    const alert = createAlert(values);
    
    if (alert) {
      try {
        await onSaveAlert(alert);
        setIsDialogOpen(false);
        setItemSearch('');
        resetForm();
        notifyCreate(alert.itemName, alert.condition, alert.threshold);
      } catch {
        toast.error('Unable to create alert', {
          description: `The alert for ${alert.itemName} could not be created.`,
        });
      }
    }
  };

  const uniqueItems = Array.from(
    new Map(availableItems.map((item) => [`${item.itemId}|${item.quality}`, item])).values(),
  );

  const filteredItems = uniqueItems.filter((item) => matchesItemSearch(item, itemSearch));

  const isAlertPending = (alertId: string) => pendingAlertIds.has(alertId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Price Alerts</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Get notified when prices match your criteria
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
            setItemSearch('');
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gold-gradient text-primary-foreground hover:opacity-90 gold-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Create Price Alert</DialogTitle>
              <DialogDescription>
                Set up a new alert to track price changes for your favorite items.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

                {/* Item Selector */}
                <FormField
                  control={form.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
                      <Input
                        value={itemSearch}
                        onChange={(event) => setItemSearch(event.target.value)}
                        placeholder="Search by item name..."
                        className="mb-2 bg-muted/50 border-border"
                      />
                          <Select
                            value={selectedItemValue}
                            onValueChange={(value) => {
                              const [itemId, quality = 'Normal'] = value.split('|');
                              field.onChange(itemId);
                              form.setValue('quality', quality as (typeof qualities)[number], {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            }}
                          >
                        <FormControl>
                          <SelectTrigger className="bg-muted/50 border-border">
                            <SelectValue placeholder="Select an item..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredItems.length === 0 ? (
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                              No items found for this search.
                            </div>
                          ) : filteredItems.map(item => (
                            <SelectItem key={`${item.itemId}|${item.quality}`} value={`${item.itemId}|${item.quality}`}>
                              <span className="flex min-w-0 items-center justify-between gap-3">
                                <span className="truncate text-left">{item.itemName}</span>
                                <span className="flex shrink-0 items-center gap-2">
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                    {formatTierBadge(item.itemId, item.tier)}
                                  </span>
                                  {getEnchantLevel(item.itemId) > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">
                                      Ench. {getEnchantLevel(item.itemId)}
                                    </span>
                                  )}
                                  {item.quality !== 'Normal' && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                      {item.quality}
                                    </span>
                                  )}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City Selector */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50 border-border">
                            <SelectValue placeholder="Select city..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Cities</SelectItem>
                          {cities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Alert Type */}
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Type</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            variant={field.value === 'below' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange('below')}
                            className={cn(field.value === 'below' && 'bg-success text-success-foreground')}
                          >
                            <ArrowDown className="h-3 w-3 mr-1" />
                            Below
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'above' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange('above')}
                            className={cn(field.value === 'above' && 'bg-destructive text-destructive-foreground')}
                          >
                            <ArrowUp className="h-3 w-3 mr-1" />
                            Above
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'change' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange('change')}
                            className={cn(field.value === 'change' && 'bg-primary text-primary-foreground')}
                          >
                            <Percent className="h-3 w-3 mr-1" />
                            Change
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Threshold */}
                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {alertType === 'change' ? 'Percentage Change' : 'Price Threshold'}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder={alertType === 'change' ? 'e.g., 15' : 'e.g., 50000'}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            className="bg-muted/50 border-border pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {alertType === 'change' ? '%' : ''}
                          </span>
                        </div>
                      </FormControl>
                      {suggestedThreshold !== null && (
                        <p className="text-xs text-muted-foreground">
                          Suggested threshold: {suggestedThreshold.toLocaleString()}
                          {alertType === 'change' ? '%' : ''}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notifications */}
                <div className="space-y-3">
                  <FormLabel>Notifications</FormLabel>
                  <Controller
                    control={form.control}
                    name="notifications.inApp"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inApp"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="inApp" className="text-sm flex items-center gap-2 cursor-pointer">
                          <BellRing className="h-4 w-4 text-muted-foreground" />
                          In-app notification
                        </label>
                      </div>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="notifications.email"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="email" className="text-sm flex items-center gap-2 cursor-pointer">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          Email notification
                        </label>
                      </div>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gold-gradient text-primary-foreground">
                    Create Alert
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Box */}
      <div className="glass-card p-4 border-l-4 border-l-primary">
        <h4 className="font-medium text-foreground mb-1">How Alerts Work</h4>
        <p className="text-sm text-muted-foreground">
          We check market prices every 15 minutes. When a price matches your alert criteria,
          you'll receive a notification through your selected channels. Alerts can be paused
          or deleted at any time.
        </p>
      </div>

      {/* Alerts List */}
      <div className="glass-card overflow-hidden">
        {alerts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No alerts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first price alert to start tracking items.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gold-gradient text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-center gap-4 p-4 transition-colors',
                  alert.isActive ? 'hover:bg-muted/30' : 'opacity-50 bg-muted/20'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center',
                  alert.isActive ? 'bg-primary/10' : 'bg-muted'
                )}>
                  {getConditionIcon(alert.condition)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{alert.itemName}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {getCityLabel(alert.city)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {getConditionText(alert)}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {alert.quality}
                    </span>
                    {getEnchantLevel(alert.itemId) > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Ench. {getEnchantLevel(alert.itemId)}
                      </span>
                    )}
                    {alert.notifications.inApp && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <BellRing className="h-3 w-3" /> In-app
                      </span>
                    )}
                    {alert.notifications.email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isAlertPending(alert.id) && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleAlert(alert)}
                    className="h-8 w-8"
                    disabled={isAlertPending(alert.id)}
                    aria-label={alert.isActive ? 'Disable alert' : 'Enable alert'}
                  >
                    {alert.isActive ? (
                      <ToggleRight className="h-5 w-5 text-success" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlert(alert.id, alert.itemName)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isAlertPending(alert.id)}
                    aria-label="Delete alert"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
