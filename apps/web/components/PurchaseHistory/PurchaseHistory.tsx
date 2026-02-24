"use client";

import { Container, Divider, ScrollArea, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { type LabPurchase, labPurchaseAPI } from "../../apis/v1/labPurchases";
import { orderAPI } from "../../apis/v1/orders";
import { premiumAPI, type TutorialPurchaseItem } from "../../apis/v1/premium";
import { trainerContactedPaymentAPI } from "../../apis/v1/trainer-contacted-payment";
import useAuth from "../../hooks/Authentication/useAuth";
import CourseTable from "./CourseTable";
import LabTable from "./LabTable";
import TeacherTable from "./TeacherTable";
import TutorialPurchaseTable from "./TutorialPurchaseTable";

const PurchaseHistory = () => {
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [labPurchases, setLabPurchases] = useState<LabPurchase[]>([]);
    const [tutorialPurchases, setTutorialPurchases] = useState<
        TutorialPurchaseItem[]
    >([]);
    const [totalCount, setTotalCount] = useState(0);
    const [paymentsTotal, setPaymentsTotal] = useState(0);
    const [labPurchasesTotal, setLabPurchasesTotal] = useState(0);

    const { user } = useAuth();

    const { data: ordersData = { orders: [], totalCount: 0 }, isFetching } =
        useQuery({
            queryKey: ["getOrder"],
            queryFn: async () => {
                const { data } = await orderAPI.getUserOrders(user?._id);
                return { orders: data.data, totalCount: data.totalCount };
            },
            enabled: !!user?._id,
        });

    const {
        data: teacherPayments = { payments: [], totalCount: 0 },
        isFetching: isPaymentsFetching,
    } = useQuery({
        queryKey: ["getTeacherPayments"],
        queryFn: async () => {
            const { data } = await trainerContactedPaymentAPI.getUserPayments(
                user?._id,
            );
            return { payments: data.data, totalCount: data.totalCount };
        },
        enabled: !!user?._id,
    });

    const {
        data: labPurchasesData = { purchases: [], totalCount: 0 },
        isFetching: isLabPurchasesFetching,
        refetch: refetchLabPurchases,
    } = useQuery({
        queryKey: ["getLabPurchases", user?._id],
        queryFn: async () => {
            const { data } = await labPurchaseAPI.getUserLabPurchases(user?._id);
            return { purchases: data.data, totalCount: data.totalCount };
        },
        enabled: !!user?._id,
    });

    const { data: premiumPurchasesData, isFetching: isPremiumFetching } =
        useQuery({
            queryKey: ["getPremiumPurchases"],
            queryFn: async () => {
                const { data } = await premiumAPI.getPurchases();
                return data;
            },
            enabled: !!user?._id,
        });

    useEffect(() => {
        if (!isFetching && ordersData) {
            setOrders(ordersData.orders);
            setTotalCount(ordersData.totalCount);
        }
    }, [isFetching, ordersData]);

    useEffect(() => {
        if (!isPaymentsFetching && teacherPayments) {
            setPayments(teacherPayments.payments);
            setPaymentsTotal(teacherPayments.totalCount);
        }
    }, [isPaymentsFetching, teacherPayments]);

    useEffect(() => {
        if (!isLabPurchasesFetching && labPurchasesData) {
            setLabPurchases(labPurchasesData.purchases);
            setLabPurchasesTotal(labPurchasesData.totalCount);
        }
    }, [isLabPurchasesFetching, labPurchasesData]);

    useEffect(() => {
        if (!isPremiumFetching && premiumPurchasesData) {
            setTutorialPurchases(premiumPurchasesData.tutorialPurchases || []);
        }
    }, [isPremiumFetching, premiumPurchasesData]);

    return (
        <Container size={"xl"} pos="relative" py="xl">
            <ScrollArea>
                <Title order={4} mb="lg">
                    Purchase history
                </Title>
                <Divider my="sm" />
                <CourseTable orders={orders} totalCount={totalCount} />
                <TutorialPurchaseTable purchases={tutorialPurchases} />
                <LabTable
                    purchases={labPurchases}
                    totalCount={labPurchasesTotal}
                    onRefundSuccess={refetchLabPurchases}
                />
                <TeacherTable payments={payments} totalCount={paymentsTotal} />
            </ScrollArea>
        </Container>
    );
};

export default PurchaseHistory;
