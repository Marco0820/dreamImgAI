import java.util.HashSet;
import java.util.Set;

/**
 * 给你两个单链表的头节点 headA 和 headB ，请你找出并返回两个单链表相交的起始节点。如果两个链表不存在相交节点，返回 null 。
 * 题目数据 保证 整个链式结构中不存在环。
 * 注意，函数返回结果后，链表必须 保持其原始结构 。
 * 自定义评测：
 * 评测系统 的输入如下（你设计的程序 不适用 此输入）：
 * intersectVal - 相交的起始节点的值。如果不存在相交节点，这一值为 0
 * listA - 第一个链表
 * listB - 第二个链表
 * skipA - 在 listA 中（从头节点开始）跳到交叉节点的节点数
 * skipB - 在 listB 中（从头节点开始）跳到交叉节点的节点数
 * 评测系统将根据这些输入创建链式数据结构，并将两个头节点 headA 和 headB 传递给你的程序。如果程序能够正确返回相交节点，那么你的解决方案将被 视作正确答案 。
 */

public class test {

    //链表节点
    public class ListNode{
        int val;
        ListNode next;
        ListNode() {};
        ListNode(int val){this.val = val;}
        ListNode(int val, ListNode next)
        {
            this.val = val;
            this.next = next;
        }

    }

    public ListNode testA(ListNode headA,ListNode headB){
        //哈希表存储链表A的节点
        Set<ListNode> nodeSet = new HashSet<>();
        ListNode curA = headA;
        //遍历链表A
        while(curA!=null){
            nodeSet.add(curA);
            curA = curA.next;
        }
        //遍历链表B
        ListNode curB = headB;
        while(curB!=null){
            if(nodeSet.contains(curB)){
                return curB;//找到相交节点
            }
            curB = curB.next;
        }
        return null;
    }


    public ListNode testB(ListNode headA,ListNode headB){
        if (headA==null||headB==null){return null;}
        ListNode ha = headA;
        ListNode hb = headB;
        while(ha!=hb){
            ha = (ha==null)?headB:
        }
    }
}
