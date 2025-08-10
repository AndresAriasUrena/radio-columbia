import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/seo';
import JsonLd from './JsonLd';

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  const breadcrumbSchema = generateBreadcrumbSchema(items);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <nav aria-label="Breadcrumb" className="mb-6 hidden xl:block">
        <ol className="flex items-center space-x-2 text-sm text-[#c7c7c7]">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-600">/</span>
              )}
              {index === items.length - 1 ? (
                <span className="text-[#E5754C] font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url} 
                  className="hover:text-[#E5754C] transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
} 