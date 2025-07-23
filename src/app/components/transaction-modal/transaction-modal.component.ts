import { CurrencyPipe } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    OnInit,
    signal,
    untracked,
    viewChild,
    ViewChild
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { take } from 'rxjs';
import { addTransactionModalAnimation } from 'src/app/animations/mobile-modal-animations';
import { BudgetCategoryWithLineItems } from 'src/app/models/budgetCategory';
import { LineItemReduced } from 'src/app/models/lineItem';
import {
    IsolatedTransaction,
    NewTransaction,
    SplitTransaction,
    Transaction
} from 'src/app/models/transaction';
import { AuthService } from 'src/app/services/auth.service';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { BudgetService } from 'src/app/services/budget.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    addValueToCurrencyInput,
    checkCurrencyInputKeyValid,
    currencyRequiredValidator,
    stripCurrency
} from 'src/app/utils/currencyUtils';
import { getMonth, getYear } from 'src/app/utils/timeUtils';
import { v4 as uuid } from 'uuid';

export interface TransactionModalData {
    mode:
        | 'add'
        | 'edit'
        | 'budgetTransactionsAdd'
        | 'budgetTransactionsAddMobile'
        | 'budgetTransactionsEdit';
    transaction?: IsolatedTransaction | Transaction;
    lineItemId?: string;
}

@Component({
    selector: 'app-transaction-modal',
    templateUrl: './transaction-modal.component.html',
    styleUrl: './transaction-modal.component.scss',
    standalone: false,
    providers: [CurrencyPipe],
    animations: [addTransactionModalAnimation]
})
export class TransactionModalComponent implements AfterViewInit, OnInit {
    @ViewChild('titleInput') titleInput!: ElementRef;
    lineItemSelect = viewChild<MatSelect>('lineItemSelect');

    transactionService = inject(TransactionService);
    budgetCategoryService = inject(BudgetCategoryService);
    lineItemService = inject(LineItemService);
    changeDetector = inject(ChangeDetectorRef);
    mobileService = inject(MobileModalService);
    budgetService = inject(BudgetService);
    currencyPipe = inject(CurrencyPipe);
    authService = inject(AuthService);

    dialogRef = inject(MatDialogRef<TransactionModalComponent>, {
        optional: true
    });
    modalData =
        inject<TransactionModalData>(MAT_DIALOG_DATA, {
            optional: true
        }) || this.mobileService.mobileModalData;

    today = new Date();
    prevSelectedDate = signal<Date | null>(null);
    isMobileModalFocused = !this.mobileService.isMobileDevice();
    isMobileLineItemModalOpen = signal(false);
    isBudgetTransactionsModal =
        this.modalData.mode === 'budgetTransactionsAdd' ||
        this.modalData.mode === 'budgetTransactionsEdit';
    calculatedSplitTransactions = signal<number | null>(null);
    prexistingTransactions: SplitTransaction[] | null = null;

    dropdownCategories = computed<BudgetCategoryWithLineItems[]>(() =>
        this.budgetCategoryService
            .budgetCategoriesWithLineItems()
            .map((budgetCategory) => ({
                ...budgetCategory,
                lineItems: budgetCategory.lineItems.map((lineItem) => {
                    return untracked(() => {
                        const foundLineItem =
                            this.lineItemService.fetchLineItem(
                                lineItem.lineItemId || ''
                            );

                        const remainingAmount =
                            this.lineItemService.calculateRemainingAmount(
                                foundLineItem?.transactions || [],
                                foundLineItem?.startingBalance || 0,
                                foundLineItem?.plannedAmount || 0
                            );

                        return { ...lineItem, remainingAmount };
                    });
                })
            }))
    );

    preSelectedLineItems = computed(() => {
        const budgetCategories =
            this.budgetCategoryService.budgetCategoriesWithLineItems();
        const lineItems = budgetCategories.flatMap(
            (category) => category.lineItems
        );

        if (this.modalData.transaction?.splitTransactionId) {
            const splitTransactions = this.getSplitTransactions();
            this.prexistingTransactions = splitTransactions;
            return splitTransactions;
        } else if (this.modalData.lineItemId) {
            const foundLineItem = lineItems.find(
                (lineItem) => this.modalData.lineItemId === lineItem.lineItemId
            );

            return [
                {
                    lineItem: foundLineItem!,
                    transaction: this.modalData.transaction
                }
            ];
        } else {
            return [];
        }
    });

    populateTransactionsFormListener = effect(() => {
        if (this.preSelectedLineItems()) {
            const transactionsArray = new FormArray(
                this.preSelectedLineItems().map(
                    (lineItem) =>
                        new FormGroup({
                            amount: new FormControl<string | undefined>(
                                this.currencyPipe.transform(
                                    lineItem.transaction?.amount
                                ) || '$0.00'
                            ),
                            transactionId: new FormControl<string | undefined>(
                                lineItem.transaction?.transactionId
                            ),
                            lineItem: new FormControl<LineItemReduced | null>(
                                lineItem.lineItem
                            )
                        })
                )
            );
            this.form.setControl('transactions', transactionsArray);

            if (this.preSelectedLineItems().length > 1) {
                this.updateSplitTransactionValidators();
            } else {
                (this.form.get('transactions') as FormArray).disable();
            }

            this.form.patchValue({
                lineItems: this.preSelectedLineItems().map(
                    (lineItem) => lineItem.lineItem
                )
            });
        }
    });

    enableLineItemsListener = effect(() => {
        if (
            this.dropdownCategories().length ||
            this.isBudgetTransactionsModal
        ) {
            this.form.get('lineItems')?.enable();
            this.form.updateValueAndValidity({ onlySelf: true });
        }
    });

    form = new FormGroup(
        {
            title: new FormControl<string | null>(
                this.modalData.transaction?.title || null,
                [Validators.required]
            ),
            totalAmount: new FormControl<number | undefined>(undefined),
            transactions: new FormArray([
                new FormGroup({
                    transactionId: new FormControl<string | undefined>(
                        undefined
                    ),
                    amount: new FormControl<string | undefined>(undefined),
                    lineItem: new FormControl<LineItemReduced | null>(null)
                })
            ]),
            lineItems: new FormControl<LineItemReduced[] | null>(
                {
                    value: [],
                    disabled: !this.dropdownCategories().length
                },
                [Validators.required]
            ),
            date: new FormControl<Date | null>(
                this.modalData.transaction?.date
                    ? new Date(this.modalData.transaction!.date)
                    : new Date(),
                [Validators.required]
            ),
            merchant: new FormControl<string | null>(
                this.modalData.transaction?.merchant || null
            ),
            notes: new FormControl<string | null>(
                this.modalData.transaction?.notes || null
            ),
            isIncomeTransaction: new FormControl<boolean>(
                this.modalData.transaction?.isIncomeTransaction || false
            )
        },
        {}
    );

    ngOnInit(): void {
        const currentBudget = this.budgetService.budget();
        const today = this.today.toLocaleDateString();

        this.budgetCategoryService.getBudgetCategoriesWithLineItems(
            this.isBudgetTransactionsModal
                ? currentBudget!.monthNumber
                : getMonth(today),
            this.isBudgetTransactionsModal
                ? currentBudget!.year
                : getYear(today)
        );
    }

    ngAfterViewInit(): void {
        if (this.mobileService.isMobileDevice()) {
            if (
                this.modalData.mode === 'budgetTransactionsAdd' ||
                this.modalData.mode === 'budgetTransactionsAddMobile'
            ) {
                const valueLength = this.titleInput.nativeElement.value.length;
                this.titleInput.nativeElement.focus();
                this.titleInput.nativeElement.setSelectionRange(
                    valueLength,
                    valueLength
                );
            }
            setTimeout(() => (this.isMobileModalFocused = true), 400);
        }

        this.form.controls.totalAmount.setValue(
            this.preSelectedLineItems().reduce(
                (total, trx) => total + (trx.transaction?.amount || 0),
                0
            )
        );
        this.form.controls.totalAmount.setValidators(Validators.min(0.01));
        this.form.controls.totalAmount.updateValueAndValidity();
        this.changeDetector.detectChanges();

        this.lineItemSelect()!._scrollOptionIntoView = () => {
            return;
        };
        const transactions = this.form.get('transactions') as FormArray;
        transactions.disable();
    }

    getCategories(e: MatDatepickerInputEvent<Date>) {
        const date = e.value;

        const newMonth = date?.getMonth();
        const newYear = date?.getFullYear();
        const prevMonth = this.prevSelectedDate()?.getMonth();
        const prevYear = this.prevSelectedDate()?.getFullYear();

        const shouldFetchCategories =
            newMonth !== prevMonth || newYear !== prevYear;

        if (date && shouldFetchCategories && !this.isBudgetTransactionsModal) {
            this.budgetCategoryService.getBudgetCategoriesWithLineItems(
                date.getMonth() + 1,
                date.getFullYear()
            );

            this.prevSelectedDate.set(date);
        }
    }

    checkIfValidKey(e: KeyboardEvent, index?: number): boolean {
        return checkCurrencyInputKeyValid(
            e,
            index !== undefined
                ? this.form.controls.transactions.at(index).value.amount || ''
                : this.form.controls.totalAmount.value || 0
        );
    }

    addValue(e: Event, index?: number) {
        const reformattedValue = addValueToCurrencyInput(
            e,
            index !== undefined ? undefined : this.form,
            'totalAmount'
        );

        if (index !== undefined && typeof reformattedValue === 'number') {
            this.form.controls.transactions.at(index).patchValue({
                amount: this.currencyPipe.transform(reformattedValue)
            });
        }

        if (this.form.controls.transactions.controls.length > 1) {
            this.calculateSplitTransactions();
        }
    }

    closeModal(transactionId?: string) {
        if (this.dialogRef) {
            this.dialogRef.close(transactionId);
        } else {
            this.mobileService.isAddTransactionModalOpen.set(false);
        }

        this.budgetCategoryService.budgetCategoriesWithLineItems.set([]);
    }

    handleLineItemSelectionChange(
        e: MatOptionSelectionChange<LineItemReduced>
    ) {
        if (e.isUserInput) {
            const selectedLineItem = e.source.value;
            const transactions = this.form.get('transactions') as FormArray;

            if (e.source.selected) {
                transactions.push(
                    new FormGroup({
                        transactionId: new FormControl<string | undefined>(
                            undefined
                        ),
                        amount: new FormControl<string | undefined>('$0.00'),
                        lineItem: new FormControl<LineItemReduced | null>(
                            selectedLineItem
                        )
                    })
                );
                this.updateSplitTransactionValidators();
                this.calculateSplitTransactions();
            } else {
                const indexToRemove = transactions.value.findIndex(
                    (trx: { lineItem: LineItemReduced; amount: number }) =>
                        trx.lineItem.lineItemId === selectedLineItem.lineItemId
                );

                transactions.removeAt(indexToRemove);
            }

            if (transactions.length > 1) {
                transactions.enable();
            } else {
                this.calculatedSplitTransactions.set(null);
                transactions.disable();
            }
        }
    }

    updateSplitTransactionValidators() {
        this.changeDetector.detectChanges();
        this.form.controls.transactions.controls.forEach((control) => {
            const amountControl = control.controls.amount;
            amountControl.setValidators(currencyRequiredValidator);
            amountControl.updateValueAndValidity();
        });
    }

    calculateSplitTransactions() {
        const totalAmount = this.form.controls.totalAmount.value;
        const transactionTotal =
            this.form.controls.transactions.controls.reduce(
                (total, trx) =>
                    stripCurrency(
                        undefined,
                        undefined,
                        trx.controls.amount.value!
                    ) + total,
                0
            );

        this.calculatedSplitTransactions.set(
            Number(((totalAmount || 0) - transactionTotal).toFixed(2))
        );
    }

    getSplitTransactions() {
        return this.budgetService
            .budget()!
            .budgetCategories.flatMap((budgetCategory) =>
                budgetCategory.lineItems.flatMap((lineItem) =>
                    lineItem.transactions
                        .filter(
                            (transaction) =>
                                transaction.splitTransactionId ===
                                this.modalData.transaction?.splitTransactionId
                        )
                        .map((trx) => ({
                            transaction: trx,
                            lineItem: {
                                lineItemName: lineItem.name,
                                lineItemId: lineItem.lineItemId,
                                remainingAmount: 0
                            }
                        }))
                )
            );
    }

    submitForm() {
        if (this.form.invalid) return;

        const currentTransactionData = this.modalData;
        const needsRefresh =
            currentTransactionData.mode !== 'budgetTransactionsAddMobile' &&
            !this.isBudgetTransactionsModal;

        const isUntracked = !currentTransactionData.transaction?.lineItemId;

        if (
            currentTransactionData.mode !== 'edit' &&
            currentTransactionData.mode !== 'budgetTransactionsEdit'
        ) {
            const submittedTransaction = this.form.value;
            const transactionModel = {
                userId: '',
                title: submittedTransaction.title || '',
                amount: 0,
                lineItemId: '',
                date: submittedTransaction.date!.toISOString(),
                merchant: submittedTransaction.merchant
                    ? submittedTransaction.merchant
                    : null,
                notes: submittedTransaction.notes || '',
                deleted: false,
                isIncomeTransaction:
                    submittedTransaction.isIncomeTransaction || false
            };

            let newTransactions: NewTransaction[];

            if (
                submittedTransaction.transactions &&
                submittedTransaction.transactions.length > 1
            ) {
                const newSplitTransactionId = uuid();
                newTransactions = submittedTransaction.transactions!.map(
                    (transaction) => ({
                        ...transactionModel,
                        splitTransactionId: newSplitTransactionId,
                        amount: stripCurrency(
                            undefined,
                            undefined,
                            transaction.amount!
                        ),
                        lineItemId: transaction.lineItem?.lineItemId || null
                    })
                );
            } else {
                newTransactions = [
                    {
                        ...transactionModel,
                        splitTransactionId: null,
                        amount: submittedTransaction.totalAmount || 0,
                        lineItemId:
                            submittedTransaction.lineItems?.[0].lineItemId ||
                            null
                    }
                ];
            }

            if (!needsRefresh) {
                this.eagerAddTransactions(newTransactions);
                this.updateEagerTransactionIds(newTransactions);
            }

            this.transactionService.addTransactions(
                newTransactions,
                needsRefresh
            );
        } else {
            const submittedTransaction = this.form.getRawValue();

            let updatedTransactions: Transaction[];
            const updatedTransactionModel = {
                transactionId: '',
                userId: this.authService.userId!,
                title: submittedTransaction.title || '',
                amount: 0,
                lineItemId: '',
                date: submittedTransaction.date!.toISOString(),
                merchant: submittedTransaction.merchant ?? null,
                notes: submittedTransaction.notes || '',
                deleted: false,
                splitTransactionId:
                    currentTransactionData.transaction!.splitTransactionId,
                isIncomeTransaction:
                    submittedTransaction.isIncomeTransaction || false
            };

            if (this.prexistingTransactions) {
                updatedTransactions = [
                    ...this.prexistingTransactions.map((trx) => {
                        const matchedTransaction =
                            submittedTransaction.transactions?.find(
                                (newTrx) =>
                                    newTrx.transactionId ===
                                    trx.transaction.transactionId
                            );

                        return {
                            ...updatedTransactionModel,
                            transactionId:
                                matchedTransaction?.transactionId ??
                                trx.transaction.transactionId,
                            deleted: !matchedTransaction,
                            amount: matchedTransaction
                                ? submittedTransaction.transactions.length === 1
                                    ? submittedTransaction.totalAmount!
                                    : stripCurrency(
                                          undefined,
                                          undefined,
                                          matchedTransaction.amount!
                                      )
                                : trx.transaction.amount,
                            lineItemId:
                                matchedTransaction?.lineItem?.lineItemId ||
                                trx.lineItem.lineItemId
                        };
                    }),
                    ...submittedTransaction.transactions
                        .filter((subTrx) => !subTrx.transactionId)
                        .map((newTrx) => {
                            return {
                                ...updatedTransactionModel,
                                amount:
                                    submittedTransaction.transactions.length ===
                                    1
                                        ? submittedTransaction.totalAmount!
                                        : stripCurrency(
                                              undefined,
                                              undefined,
                                              newTrx.amount!
                                          ),
                                lineItemId: newTrx.lineItem?.lineItemId
                            };
                        })
                ];
            } else {
                const newUUID = uuid();
                updatedTransactions = [
                    ...submittedTransaction.transactions.map(
                        (trx, i, trxs) => ({
                            ...updatedTransactionModel,
                            transactionId: trx.transactionId ?? '',
                            amount:
                                trxs.length === 1
                                    ? submittedTransaction.totalAmount!
                                    : stripCurrency(
                                          undefined,
                                          undefined,
                                          trx.amount!
                                      ),
                            ...(trxs.length > 1 && {
                                splitTransactionId: newUUID
                            }),
                            lineItemId: trx.lineItem?.lineItemId
                        })
                    )
                ];
            }

            if (!needsRefresh) {
                const addTransactions = updatedTransactions.filter(
                    (trx) => !trx.transactionId
                );
                const updateTransactions = updatedTransactions.filter(
                    (trx) => !trx.deleted && trx.transactionId
                );
                const deleteTransactions = updatedTransactions.filter(
                    (trx) => trx.deleted
                );

                if (addTransactions.length > 0) {
                    this.eagerAddTransactions(addTransactions);
                    this.updateEagerTransactionIds(addTransactions);
                }
                if (updateTransactions.length > 0) {
                    this.eagerUpdateTransactions(updateTransactions);
                }
                if (deleteTransactions.length > 0) {
                    this.eagerDeleteTransactions(deleteTransactions);
                }
            }

            this.transactionService.updateTransactions(
                updatedTransactions,
                (currentTransactionData.transaction as IsolatedTransaction)
                    ?.budgetCategoryName,
                needsRefresh
            );
        }
        this.closeModal(
            isUntracked
                ? currentTransactionData.transaction?.transactionId
                : undefined
        );
    }

    setIsIncomeSelectedValue(isIncomeTransaction: boolean) {
        this.form.patchValue({ isIncomeTransaction: isIncomeTransaction });
        if (!this.form.dirty) {
            this.form.markAsDirty();
        }
    }

    eagerAddTransactions(transactions: NewTransaction[]) {
        transactions.forEach((transaction) => {
            const foundLineItem =
                transaction.lineItemId &&
                this.lineItemService.fetchLineItem(transaction.lineItemId);

            if (foundLineItem) {
                foundLineItem.transactions = [
                    ...foundLineItem.transactions,
                    { ...transaction, transactionId: '' }
                ] as Transaction[];
            }
        });
    }

    updateEagerTransactionIds(newClientTransactions: NewTransaction[]) {
        this.transactionService.newlyCreatedTransactions
            .pipe(take(1))
            .subscribe((transactions) => {
                newClientTransactions.forEach((transaction) => {
                    const newEagerTransaction =
                        transaction.lineItemId &&
                        this.lineItemService
                            .fetchLineItem(transaction.lineItemId)
                            ?.transactions.find((trx) => !trx.transactionId);

                    const matchedServerTransaction = transactions.find(
                        (serverTrx) =>
                            serverTrx.lineItemId === transaction.lineItemId
                    );

                    if (newEagerTransaction) {
                        newEagerTransaction.transactionId =
                            matchedServerTransaction?.transactionId ?? '';
                    }
                });
            });
    }

    eagerUpdateTransactions(transactions: Transaction[]) {
        transactions.forEach((trx) => {
            const foundLineItem =
                trx.lineItemId &&
                this.lineItemService.fetchLineItem(trx.lineItemId);

            if (foundLineItem) {
                foundLineItem.transactions = foundLineItem.transactions.map(
                    (t) =>
                        t.transactionId === trx.transactionId ? { ...trx } : t
                );
            }
        });
    }

    eagerDeleteTransactions(transactions: Transaction[]) {
        transactions.forEach((trx) => {
            const foundLineItem = this.lineItemService.fetchLineItem(
                trx.lineItemId!
            );

            if (foundLineItem) {
                foundLineItem.transactions = foundLineItem.transactions.filter(
                    (transaction) => {
                        return transaction.transactionId !== trx.transactionId;
                    }
                );
            }
        });
    }

    getSelectedLineItem(o1: LineItemReduced, o2: LineItemReduced) {
        return o1?.lineItemId === o2?.lineItemId;
    }

    getSelectedLineItemLabel() {
        return this.form.controls.lineItems.value
            ?.map((item) => item?.lineItemName)
            .join(', ');
    }

    openMobileLineItemModal(e: TouchEvent) {
        if (this.dropdownCategories().length > 0) {
            e.preventDefault();
            document.querySelectorAll('input').forEach((input) => {
                input.blur();
            });
            this.isMobileLineItemModalOpen.set(true);
        }
    }

    handleLineItemSelectionModalClose() {
        const transactions = this.form.get('transactions') as FormArray;
        const updatedSplitTransactions =
            this.form.controls.lineItems.value!.map((lineItem) => {
                const foundTrx = transactions.value.find(
                    (trx: {
                        transactionId: string;
                        lineItem: LineItemReduced;
                        amount: number;
                    }) => trx.lineItem.lineItemId === lineItem.lineItemId
                );
                return new FormGroup({
                    transactionId: new FormControl<string | undefined>(
                        foundTrx?.transactionId ?? undefined
                    ),
                    amount: new FormControl<string | undefined>(
                        foundTrx?.amount ?? '$0.00'
                    ),
                    lineItem: new FormControl<LineItemReduced | null>(lineItem)
                });
            });

        this.form.setControl(
            'transactions',
            new FormArray(updatedSplitTransactions)
        );
        this.updateSplitTransactionValidators();
        this.calculateSplitTransactions();

        const newTransactionsControl = this.form.controls.transactions;
        if (this.form.controls.transactions.value.length > 1) {
            newTransactionsControl.enable();
        } else {
            this.calculatedSplitTransactions.set(null);
            newTransactionsControl.disable();
        }

        this.isMobileLineItemModalOpen.set(false);
    }
}
