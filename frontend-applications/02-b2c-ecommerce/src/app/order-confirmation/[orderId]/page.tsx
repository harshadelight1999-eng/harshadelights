import dynamic from 'next/dynamic';

export async function generateStaticParams() {
  // For static export, we'll pre-generate some common order IDs
  return [
    { orderId: 'sample-order' },
    { orderId: 'demo-order' },
  ];
}

const OrderConfirmationClient = dynamic(() => import('./OrderConfirmationClient'), {
  ssr: false,
});

export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  return <OrderConfirmationClient orderId={params.orderId} />;
}