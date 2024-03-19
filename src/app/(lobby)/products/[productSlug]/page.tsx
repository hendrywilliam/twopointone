import { db } from "@/db/core";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import type { UploadData } from "@/types";
import { notFound } from "next/navigation";
import { parse_to_json } from "@/lib/utils";
import { StarIcon } from "@/components/ui/icons";
import { siteStaticMetadata } from "@/config/site";
import type { Metadata, ResolvingMetadata } from "next";
import { Product, Store, products, stores } from "@/db/schema";
import ProductPanel from "@/components/lobby/product/product-panel";
import ImageSelector from "@/components/lobby/product/image-selector";
import ProductCommentSection from "@/components/lobby/product/comment-section";

interface ProductPageProps {
  params: { productSlug: string };
}

export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const productDetails = await db.query.products.findFirst({
    where: eq(products.slug, params.productSlug),
  });

  return {
    title: productDetails?.name
      ? `${productDetails?.name} — commerce`
      : "commerce by hendryw",
    description:
      productDetails?.description ??
      "A fictional marketplace built with everything new in Next.js 14",
    ...siteStaticMetadata,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const productAndStore = (
    await db
      .select({ product: products, store: stores })
      .from(products)
      .where(eq(products.slug, params.productSlug))
      .leftJoin(stores, eq(stores.id, products.storeId))
      .limit(1)
  )[0] as {
    product: Product;
    store: Store;
  };

  if (!productAndStore) {
    notFound();
  }

  const { product, store } = productAndStore;
  const parsedImage = parse_to_json<UploadData[]>(
    productAndStore.product.image as string,
  );

  return (
    <div className="container flex h-full w-full flex-col space-y-4 pb-8">
      <div className="my-2 flex h-max w-full flex-col gap-10 lg:flex-row">
        <div className="group relative h-full w-full overflow-hidden rounded">
          <ImageSelector images={parsedImage} />
        </div>
        <div className="flex w-full gap-2">
          <ProductPanel product={product} store={store} />
        </div>
      </div>
    </div>
  );
}