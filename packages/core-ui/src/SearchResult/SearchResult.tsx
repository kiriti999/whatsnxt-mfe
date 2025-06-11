import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Anchor, Skeleton } from '@mantine/core';
import styles from './SearchResult.module.css';

export type SearchResultProps = {
  data: any[] | null;
  isLoading: boolean;
  search: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef: React.RefObject<HTMLDivElement>;
};

export const SearchResult = ({ data, isLoading, search, show, setShow, containerRef }: SearchResultProps) => {

  return (
    <div className={styles['search-results']} ref={containerRef}>
      {data && search.length > 1 && show && (
        <>
          {isLoading ? (
            [...Array(3).keys()].map(i => <Skeleton key={i} height={50} my={5} />)
          ) : (
            <div className="bg-light">
              {data.map((content, i) => (
                <Anchor underline="never"
                  component={Link}
                  key={i}
                  href={'/courses/' + content.slug}
                  className="row p-2"
                  onClick={() => setShow(false)}
                >
                  <div className="col-md-3">
                    <Image
                      src={content?.courseImageUrl}
                      alt="none"
                      width={200}
                      height={150}
                      style={{ height: 'auto' }}
                    />
                  </div>
                  <div className="col-md">
                    <div>
                      <strong>{content.title}</strong>
                    </div>
                  </div>
                </Anchor>
              ))}
            </div>
          )}
          {!isLoading && data.length === 0 && (
            <h6 className="p-2">No search results available</h6>
          )}
        </>
      )}
    </div>
  );
};
