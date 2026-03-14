'use client';
import React, { ReactNode } from 'react';
import { Card, CardHeader, CardBody, CardProps } from "@heroui/card";
import { Divider } from '@heroui/divider';

interface BoxCardProps extends CardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const BoxCard: React.FC<BoxCardProps> = ({ title, children, footer, className, ...rest }) => {
  return (
    <Card
      {...rest}
      className={`${className ?? "bg-transparent"} dark:bg-gray-900`}
    >
      <CardHeader className="flex gap-3 items-center text-current font-semibold text-lg ">
        <h1 className="text-lg font-semibold uppercase">{title}</h1>
      </CardHeader>

      <Divider />

      <CardBody>
        {children}
      </CardBody>

      {footer && (
        <>
          <Divider />
          <div className="p-3">{footer}</div>
        </>
      )}
    </Card>
  );
};

export default BoxCard;
