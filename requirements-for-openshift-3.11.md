# Requirements for OpenShift 3.11 Clusters

**Upgrade your 3.11.x version  to a version that is 3.11.200 and up**

**Hosts file example**
```
# grep -E *3.11* inventory/hosts 
# ansible inventory for OpenShift Container Platform  3.11.154
openshift_image_tag=v3.11.404
openshift_pkg_version=-3.11.154
openshift_release=3.11
```

* [OpenShift Container Platform 3.11 Release Notes](https://docs.openshift.com/container-platform/3.11/release_notes/ocp_3_11_release_notes.html)
* [Performing automated in-place cluster upgrades ](https://docs.openshift.com/container-platform/3.11/upgrading/automated_upgrades.html#preparing-for-an-automated-upgrade)

**Download latest OC cli on jumpbox**
```
$ curl -OL https://raw.githubusercontent.com/tosin2013/openshift-4-deployment-notes/master/pre-steps/configure-openshift-packages.sh
$ chmod +x configure-openshift-packages.sh
$ ./configure-openshift-packages.sh -i
```
> Use the updated oc client adn kubectl to run the import command for the 3.11 cluster. 

**For Disconnected Environments udpate the RHACM repo endpoints**
* [Set Custom Image endpoints for ACM Deployments](https://github.com/tosin2013/openshift-4-deployment-notes/blob/master/acm/set-custom-repo-endpoints.md)

**Import ACM cluster**
* [IMPORTING A TARGET MANAGED CLUSTER TO THE HUB CLUSTER](https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/2.2/html/manage_cluster/importing-a-target-managed-cluster-to-the-hub-cluster)

**Login to OCP 3.11 cluster using latest oc cli**
```
$ oc login
```

**Run import command against the cluster your 3.11 cluster**


## Capacity Planning Dashboard requirements
> For the Capacity Planning dashboard to work you must configure custom dashboarding.

[Getting Started with Custom Dashboarding on OpenShift using Grafana](https://github.com/redhat-cop/openshift-toolkit/tree/master/custom-dashboards)

An [OpenShift Applier](https://github.com/redhat-cop/openshift-applier) inventory has been supplied for deployment convenience. Two playbooks are also provided. The first is to deploy the OpenShift Monitoring stack, using [openshift-ansible](https://github.com/openshift/openshift-ansible), the second deploys the custom Grafana.

1. First, you must download the prerequsite repositories, [OpenShift Ansible](https://github.com/openshift/openshift-ansible), and [OpenShift Applier](https://github.com/redhat-cop/openshift-applier).
        
        git clone https://github.com/redhat-cop/openshift-toolkit
        cd openshift-toolkit/custom-dashboards
        ansible-galaxy install -r requirements.yml -p galaxy


2. (Optional) If you are running on an OpenShift Cluster older than 3.11, or your cluster did not have the monitoring stack installed at first install, you can use the following command to install the monitoring stack:

        ansible-playbook -i /path/to/cluster/inventory/ monitoring.yml

3. Finally, run the apply.yml playbook to deploy Grafana and all of the Dashboards.

        ansible-playbook -i .applier/ galaxy/openshift-applier/playbooks/openshift-cluster-seed.yml

4. Now install the dashboard-capacity 

        ansible-galaxy install -r requirements.yml -p galaxy
        ansible-playbook -i .applier/ galaxy/openshift-applier/playbooks/openshift-cluster-seed.yml \
        -e include_tags="dashboard-capacity,openshift-3"


## Links:  
* [Troubleshooting cluster with pending import status](https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/2.2/html/troubleshooting/troubleshooting#troubleshooting-cluster-with-pending-import-status)
* [Capacity Management Dashboard](https://github.com/redhat-cop/openshift-toolkit/tree/master/capacity-dashboard)
* [Getting Started with Custom Dashboarding on OpenShift using Grafana](https://github.com/redhat-cop/openshift-toolkit/tree/master/custom-dashboards)