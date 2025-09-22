'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Upload, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import Papa from 'papaparse';

interface QuickOrderItem {
  sku: string;
  quantity: number;
  productName?: string;
  unitPrice?: number;
  totalPrice?: number;
  error?: string;
}

export function QuickOrderForm() {
  const router = useRouter();
  const [items, setItems] = useState<QuickOrderItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addItem = () => {
    setItems([...items, { sku: '', quantity: 1 }]);
  };

  const updateItem = (index: number, field: keyof QuickOrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const csvItems: QuickOrderItem[] = results.data
          .filter((row: any) => row.sku && row.quantity)
          .map((row: any) => ({
            sku: row.sku,
            quantity: parseInt(row.quantity) || 1,
            productName: row.productName,
          }));
        setItems([...items, ...csvItems]);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });
  };

  const validateItems = async () => {
    const validatedItems = await Promise.all(
      items.map(async (item) => {
        try {
          // TODO: Validate SKU against API
          const response = await fetch(`/api/products/validate-sku/${item.sku}`);
          if (response.ok) {
            const data = await response.json();
            return {
              ...item,
              productName: data.productName,
              unitPrice: data.unitPrice,
              totalPrice: item.quantity * data.unitPrice,
              error: undefined,
            };
          } else {
            return {
              ...item,
              error: 'Invalid SKU',
            };
          }
        } catch (error) {
          return {
            ...item,
            error: 'Validation failed',
          };
        }
      })
    );
    setItems(validatedItems);
    return validatedItems;
  };

  const handleSubmit = async () => {
    const validatedItems = await validateItems();
    const hasErrors = validatedItems.some(item => item.error);

    if (hasErrors) {
      alert('Please fix validation errors before submitting');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Submit order to API
      const response = await fetch('/api/orders/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: validatedItems.filter(item => !item.error),
        }),
      });

      if (response.ok) {
        router.push('/orders');
      } else {
        alert('Failed to submit order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error submitting order');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = items
    .filter(item => item.totalPrice && !item.error)
    .reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Order by SKU</CardTitle>
          <CardDescription>
            Enter SKUs and quantities for quick ordering, or upload a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="csv-upload">Upload CSV File</Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                CSV format: sku, quantity (optional: productName)
              </p>
            </div>
            <div className="flex items-end">
              <Button onClick={addItem} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Row
              </Button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.sku}
                          onChange={(e) => updateItem(index, 'sku', e.target.value)}
                          placeholder="HD-KK-001"
                        />
                      </TableCell>
                      <TableCell>
                        {item.productName || (
                          <span className="text-gray-500">Auto-filled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        {item.unitPrice ? (
                          formatCurrency(item.unitPrice)
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.totalPrice ? (
                          formatCurrency(item.totalPrice)
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalAmount > 0 && (
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={validateItems}
              variant="outline"
              disabled={items.length === 0}
            >
              Validate SKUs
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={items.length === 0 || isProcessing}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
